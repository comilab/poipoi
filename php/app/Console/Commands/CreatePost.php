<?php

namespace App\Console\Commands;

use App\Models\Image;
use App\Models\Post;
use App\Models\User;
use App\Services\Image as ServicesImage;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class CreatePost extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'poipoi:create-post {file}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Create a post';

    /**
     * @var \App\Services\Image
     */
    protected $image;

    /**
     * Create a new command instance.
     *
     * @return void
     */
    public function __construct(ServicesImage $image)
    {
        parent::__construct();

        $this->image = $image;
    }

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        $filePath = base_path($this->argument('file'));
        $dirPath = dirname($filePath);
        if (!file_exists($filePath)) {
            echo 'ファイルが存在しません';
            return 1;
        }

        $data = json_decode(file_get_contents($filePath), true);

        $user = User::first();

        if (!$user) {
            echo 'ユーザーが存在しません';
            return 1;
        }

        DB::transaction(function () use ($dirPath, $data, $user) {
            $post = new Post($data);
            $user->posts()->save($post);
            $post->syncTagsFromCaption();

            $post->makeImagesDir();

            foreach ($data['images'] as $i => $imageData) {
                $image = new Image();
                $image->post_id = $post->id;
                $image->weight = $i;

                $original = "{$dirPath}/{$imageData['path']}";
                $pathinfo = pathinfo($original);
                $basename = $pathinfo['basename'];
                $filename = $pathinfo['filename'];
                $extension = $pathinfo['extension'];

                $image->filename = $filename;
                $image->extension = $extension;
                $image->save();

                copy($original, Storage::path($image->paths['original']));

                // large
                $this->image->resize(
                    Storage::path($image->paths['original']),
                    Storage::path($image->paths['large']),
                    1000,
                    1000
                );

                // medium
                $this->image->resize(
                    Storage::path($image->paths['original']),
                    Storage::path($image->paths['medium']),
                    600,
                    600
                );

                // small
                $this->image->resize(
                    Storage::path($image->paths['original']),
                    Storage::path($image->paths['small']),
                    250,
                    250
                );
            }
        });

        return 0;
    }
}
