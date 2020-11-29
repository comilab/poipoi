<?php

namespace Database\Factories;

use App\Models\Image;
use App\Models\Post;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Intervention\Image\Facades\Image as FacadesImage;

class ImageFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Image::class;

    /**
     * Define the model's default state.
     *
     * @return array
     */
    public function definition()
    {
        return [
            'post_id' => Post::factory(),
            'filename' => Str::random(),
            'extension' => $this->faker->randomElement(['jpeg', 'png', 'gif']),
            'weight' => $this->faker->unique()->randomNumber(),
        ];
    }

    public function withActualFile()
    {
        return $this->state(function (array $attributes) {
            $postId = null;
            if (empty($params['post_id'])) {
                $postId = Post::factory()->create()->id;
            } else {
                $postId = $attributes['post_id'];
            }

            $postImageDir = "public/images/{$postId}";
            Storage::makeDirectory($postImageDir);

            $original = $this->faker->image(Storage::path($postImageDir), 10, 10);

            $pathinfo = pathinfo($original);
            $basename = $pathinfo['basename'];
            $filename = $pathinfo['filename'];
            $extension = $pathinfo['extension'];
            Storage::move("{$postImageDir}/{$basename}", "{$postImageDir}/original_{$basename}");

            Storage::copy("{$postImageDir}/original_{$basename}", "{$postImageDir}/large_{$filename}.jpeg");
            Storage::copy("{$postImageDir}/original_{$basename}", "{$postImageDir}/medium_{$filename}.jpeg");
            Storage::copy("{$postImageDir}/original_{$basename}", "{$postImageDir}/small_{$filename}.jpeg");

            return [
                'post_id' => $postId,
                'filename' => $filename ? $filename : Str::random(),
                'extension' => $extension ? $extension : $this->faker->randomElement(['jpeg', 'png', 'gif']),
            ];
        });
    }
}
