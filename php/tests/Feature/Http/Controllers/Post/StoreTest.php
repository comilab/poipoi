<?php

namespace Tests\Feature\Http\Controllers\Post;

use App\Models\Image;
use App\Models\Post;
use App\Models\User;
use App\Services\Setting;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class StoreTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    /**
     * @var array
     */
    protected $input;

    protected function setUp(): void
    {
        parent::setUp();

        Storage::fake();

        $this->app->make(Setting::class)->fake();

        $publishEnd = $this->faker->dateTime(Carbon::now()->addYear());
        $publishStart = $this->faker->dateTime($publishEnd);
        $this->input = [
            'title' => $this->faker->text(32),
            'caption' => $this->faker->text(200),
            'showImagesList' => $this->faker->boolean(),
            'text' => $this->faker->text(300000),
            'scope' => $this->faker->randomElement(['public', 'password', 'private']),
            'password' => $this->faker->password,
            'publishStart' => $this->faker->optional()->passthrough($publishStart->format('Y-m-d H:i:s')),
            'publishEnd' => $this->faker->optional()->passthrough($publishEnd->format('Y-m-d H:i:s')),
            'rating' => $this->faker->randomElement([null, 'nsfw', 'r18']),
            'pinned' => $this->faker->boolean(),
            'showThumbnail' => $this->faker->boolean(),
            'denyRobot' => $this->faker->randomElement([null, true, false]),
            'enableReaction' => $this->faker->randomElement([null, true, false]),
            'allowedEmojis' => [$this->faker->emoji],
            'deniedEmojis' => [$this->faker->emoji],
            'enableTwitterShare' => $this->faker->randomElement([null, true, false]),
            'images' => [],
        ];
    }

    public function testログインしていなければエラー()
    {
        $this->postJson('/api/posts', $this->input)
            ->assertUnauthorized();
    }

    public function test投稿が保存される()
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $this->postJson('/api/posts', $this->input)
            ->assertSuccessful();

        $this->assertSame(1, Post::count());
        $post = Post::first();

        $this->assertSame($user->id, $post->user_id);
        $this->assertSame($this->input['title'], $post->title);
        $this->assertSame($this->input['caption'], $post->caption);
        $this->assertSame($this->input['showImagesList'], $post->show_images_list);
        $this->assertSame($this->input['text'], $post->text);
        $this->assertSame($this->input['scope'], $post->scope);
        $this->assertSame($this->input['password'], $post->password);
        $this->assertEquals($this->input['publishStart'], $post->publish_start);
        $this->assertEquals($this->input['publishEnd'], $post->publish_end);
        $this->assertSame($this->input['rating'], $post->rating);
        $this->assertSame($this->input['pinned'], $post->pinned);
        $this->assertSame($this->input['showThumbnail'], $post->show_thumbnail);
        $this->assertSame($this->input['denyRobot'], $post->deny_robot);
        $this->assertSame($this->input['enableReaction'], $post->enable_reaction);
        $this->assertSame($this->input['allowedEmojis'], $post->allowed_emojis->toArray());
        $this->assertSame($this->input['deniedEmojis'], $post->denied_emojis->toArray());
        $this->assertSame($this->input['enableTwitterShare'], $post->enable_twitter_share);
    }

    public function testキャプションにハッシュタグがあれば保存される()
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $tag = $this->faker->word();
        $this->input['caption'] = "#{$tag}";

        $this->postJson('/api/posts', $this->input)
            ->assertSuccessful();

        $post = Post::first();
        $this->assertSame(1, $post->tags()->count());
        $this->assertSame($tag, $post->tags()->first()->name);
    }

    public function test画像があれば保存される()
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        Storage::makeDirectory('temp');
        $tempImage = $this->faker->image(Storage::path('temp'), 10, 10, null, false);
        Storage::copy("temp/{$tempImage}", "temp/{$tempImage}.large");
        Storage::copy("temp/{$tempImage}", "temp/{$tempImage}.medium");
        Storage::copy("temp/{$tempImage}", "temp/{$tempImage}.small");
        $this->input['images'][] = "temp/{$tempImage}";

        $this->postJson('/api/posts', $this->input)
            ->assertSuccessful();

        $this->assertSame(1, Image::count());
        $post = Post::first();
        $image = Image::first();

        $this->assertSame($post->id, $image->post_id);
        $this->assertSame(pathinfo($tempImage, PATHINFO_FILENAME), $image->filename);
        $this->assertSame('png', $image->extension);
        $this->assertSame(0, $image->weight);
        $this->assertFileExists(Storage::path($image->paths['original']));
        $this->assertFileExists(Storage::path($image->paths['large']));
        $this->assertFileExists(Storage::path($image->paths['medium']));
        $this->assertFileExists(Storage::path($image->paths['small']));
    }

    public function test投稿データを返す()
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $response = $this->postJson('/api/posts', $this->input)
            ->assertSuccessful();

        $post = Post::first();
        $response->assertJsonPath('id', $post->id);
    }
}
