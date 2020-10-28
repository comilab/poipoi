<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePostReaction;
use App\Http\Resources\Reaction as ReactionResource;
use App\Models\Post;
use App\Models\Reaction;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class PostReactionController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum', ['except' => ['index', 'store']]);
        $this->authorizeResource(Reaction::class);
    }

    /**
     * Display a listing of the resource.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Post  $post
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request, Post $post)
    {
        $request->validate([
            'lt' => ['required', 'date_format:Y-m-d\TH:i:s.v\Z'],
        ]);

        $reactions = $post->reactions()
            ->where('created_at', '<', Carbon::parse($request->input('lt')))
            ->paginate(100);

        return ReactionResource::collection($reactions);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  StorePostReaction  $request
     * @param  \App\Models\Post  $post
     * @return \Illuminate\Http\Response
     */
    public function store(StorePostReaction $request, Post $post)
    {
        $reaction = new Reaction($request->validated());
        $post->reactions()->save($reaction);

        return new ReactionResource($reaction);
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\Post  $post
     * @param  \App\Models\Reaction  $reaction
     * @return \Illuminate\Http\Response
     */
    public function show(Post $post, Reaction $reaction)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Post  $post
     * @param  \App\Models\Reaction  $reaction
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, Post $post, Reaction $reaction)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\Post  $post
     * @param  \App\Models\Reaction  $reaction
     * @return \Illuminate\Http\Response
     */
    public function destroy(Post $post, Reaction $reaction)
    {
        if (!$post->is_mine) {
            return abort(404);
        }

        $reaction->delete();

        return response('ok');
    }
}
