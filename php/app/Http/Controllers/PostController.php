<?php

namespace App\Http\Controllers;

use App\Http\Requests\SavePost;
use App\Http\Requests\VerifyPost;
use App\Http\Resources\Post as ResourcesPost;
use App\Http\Resources\ProtectedPost as ResourcesProtectedPost;
use App\Models\Image;
use App\Models\Post;
use App\Models\Tag;
use App\Services\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class PostController extends Controller
{
    protected $setting;

    public function __construct(Setting $setting)
    {
        $this->setting = $setting;

        $this->middleware('auth:sanctum', ['except' => ['index', 'show', 'verify']]);
        $this->authorizeResource(Post::class);
        $this->middleware('can:verify,post')->only('verify');
    }

    /**
     * Display a listing of the resource.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        $query = Post::with(['images'])
            ->withCount('images')
            ->orderBy('pinned', 'desc')
            ->orderBy('created_at', 'desc');

        if (!auth()->check()) {
            $query->public();
        }

        if ($request->get('keyword')) {
            $query->search($request->get('keyword'));
        }

        $posts = $query->paginate($this->setting->get('perPage'));

        return ResourcesProtectedPost::collection($posts);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  SavePost  $request
     * @return \Illuminate\Http\Response
     */
    public function store(SavePost $request)
    {
        $post = new Post($request->snakeCasedValidated());

        DB::transaction(function () use ($request, $post) {
            $request->user()->posts()->save($post);
            $post->syncTagsFromCaption();

            $post->makeImagesDir();

            foreach ($request->input('images') as $key => $file) {
                $image = new Image();
                $image->post_id = $post->id;
                $image->filename = pathinfo($file, PATHINFO_FILENAME);
                $image->extension = str_replace('image/', '', Storage::mimeType($file));
                $image->weight = $key;
                $image->save();

                $image->saveImage($file);
            }
        });

        return new ResourcesPost($post);
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\Post  $post
     * @return \Illuminate\Http\Response
     */
    public function show(Post $post)
    {
        if (!$post->is_mine && !$post->is_public) {
            return abort(404);
        }

        if (!$post->is_mine && $post->scope === 'password') {
            return new ResourcesProtectedPost($post);
        }

        $post
            ->load([
                'images',
                'reactions' => function ($query) {
                    $query->limit(100);
                },
            ])
            ->loadCount('reactions');

        return new ResourcesPost($post);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  SavePost  $request
     * @param  \App\Models\Post  $post
     * @return \Illuminate\Http\Response
     */
    public function update(SavePost $request, Post $post)
    {
        $post->fill($request->snakeCasedValidated());

        DB::transaction(function () use ($request, $post) {
            $post->save();
            $post->syncTagsFromCaption();
            $post->loadMissing('images');

            $preserveImageIds = [];
            foreach ($request->input('images') as $key => $file) {
                if (is_string($file)) {
                    $image = new Image();
                    $image->post_id = $post->id;
                    $image->filename = pathinfo($file, PATHINFO_FILENAME);
                    $image->extension = str_replace('image/', '', Storage::mimeType($file));
                    $image->weight = $key;
                    $image->save();

                    $image->saveImage($file);
                } else {
                    $image = $post->images->firstWhere('id', $file['id']);
                    $image->weight = $key;
                    $image->save();
                    $preserveImageIds[] = $file['id'];
                }
            }

            $deleteImageIds = $post->images
                ->except($preserveImageIds)
                ->each(function (Image $oldImage) {
                    $oldImage->deleteImage();
                })
                ->pluck('id');
            Image::destroy($deleteImageIds);
        });

        return new ResourcesPost($post);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\Post  $post
     * @return \Illuminate\Http\Response
     */
    public function destroy(Post $post)
    {
        DB::transaction(function () use ($post) {
            $post->delete();
            Tag::clean();
            $post->deleteImagesDir();
        });

        return response('ok');
    }

    public function verify(VerifyPost $request, Post $post)
    {
        if (!$post->is_mine && !$post->is_public) {
            return abort(404);
        }

        if ($post->scope !== 'password') {
            return abort(404);
        }

        if ($request->input('password') === $post->password) {
            $post
                ->loadMissing([
                    'images',
                    'reactions' => function ($query) {
                        $query->limit(100);
                    },
                ])
                ->loadCount('reactions');

            return new ResourcesPost($post);
        }

        return abort(401);
    }
}
