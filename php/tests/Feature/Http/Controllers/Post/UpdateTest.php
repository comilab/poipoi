<?php

namespace Tests\Feature\Http\Controllers\Post;

use App\Models\Image;
use App\Models\Post;
use App\Models\Tag;
use App\Models\User;
use App\Services\Setting;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class UpdateTest extends TestCase
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
        $post = Post::factory()->create();

        $this->putJson("/api/posts/{$post->id}", $this->input)
            ->assertUnauthorized();
    }

    public function test自分の投稿でなければエラー()
    {
        $user = User::factory()->create();
        $post = Post::factory()->create();
        Sanctum::actingAs($user);

        $this->putJson("/api/posts/{$post->id}", $this->input)
            ->assertForbidden();
    }

    public function test投稿が保存される()
    {
        $user = User::factory()->create();
        $post = Post::factory()->create([
            'user_id' => $user->id,
        ]);
        Sanctum::actingAs($user);

        $this->putJson("/api/posts/{$post->id}", $this->input)
            ->assertSuccessful();

        $post->refresh();

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

    public function testキャプション内のハッシュタグの紐付けが更新される()
    {
        $user = User::factory()->create();
        $post = Post::factory()->create([
            'user_id' => $user->id,
        ]);
        $tag1 = Tag::factory()->create([
            'name' => $this->faker->unique()->word(),
        ]);
        $tag2 = Tag::factory()->create([
            'name' => $this->faker->unique()->word(),
        ]);
        $post->tags()->attach([$tag1->id, $tag2->id]);
        Sanctum::actingAs($user);

        $newTag = $this->faker->unique()->word();
        $this->input['caption'] = "#{$tag1->name} #{$newTag}";

        $this->putJson("/api/posts/{$post->id}", $this->input)
            ->assertSuccessful();

        $this->assertSame(2, $post->tags()->count());
        $this->assertNotEmpty($post->tags()->firstWhere('name', $tag1->name));
        $this->assertNotEmpty($post->tags()->firstWhere('name', $newTag));
    }

    public function test新規追加された画像があれば保存する()
    {
        $user = User::factory()->create();
        $post = Post::factory()->create([
            'user_id' => $user->id,
        ]);
        Sanctum::actingAs($user);

        Storage::makeDirectory('temp');
        $tempImage = $this->faker->image(Storage::path('temp'), 1, 1, null, false);
        Storage::copy("temp/{$tempImage}", "temp/{$tempImage}.large");
        Storage::copy("temp/{$tempImage}", "temp/{$tempImage}.medium");
        Storage::copy("temp/{$tempImage}", "temp/{$tempImage}.small");
        $this->input['images'][] = "temp/{$tempImage}";

        $this->putJson("/api/posts/{$post->id}", $this->input)
            ->assertSuccessful();

        $this->assertSame(1, Image::count());
        $image = Image::first();

        $this->assertSame($post->id, $image->post_id);
        $this->assertSame(pathinfo($tempImage)['filename'], $image->filename);
        $this->assertSame('png', $image->extension);
        $this->assertSame(0, $image->weight);
        $this->assertFileExists(Storage::path($image->paths['original']));
        $this->assertFileExists(Storage::path($image->paths['large']));
        $this->assertFileExists(Storage::path($image->paths['medium']));
        $this->assertFileExists(Storage::path($image->paths['small']));
    }

    public function test既に画像がある場合はweightのみ更新する()
    {
        $user = User::factory()->create();
        $post = Post::factory()->create([
            'user_id' => $user->id,
        ]);
        $image = Image::factory()->create([
            'post_id' => $post->id,
            'weight' => $this->faker->randomDigitNotNull,
        ]);
        Sanctum::actingAs($user);

        $this->input['images'][] = $image->toArray();

        $this->putJson("/api/posts/{$post->id}", $this->input)
            ->assertSuccessful();

        $newImage = $image->fresh();

        $this->assertSame($image->filename, $newImage->filename);
        $this->assertSame($image->extension, $newImage->extension);
        $this->assertSame(0, $newImage->weight);
    }

    public function test使われなくなった画像は掃除する()
    {
        $user = User::factory()->create();
        $post = Post::factory()->create([
            'user_id' => $user->id,
        ]);
        $image = Image::factory()->withActualFile()->create([
            'post_id' => $post->id,
        ]);
        Sanctum::actingAs($user);

        $this->putJson("/api/posts/{$post->id}", $this->input)
            ->assertSuccessful();

        $this->assertSame(0, $post->images()->count());
        $this->assertFileDoesNotExist(Storage::path($image->paths['original']));
        $this->assertFileDoesNotExist(Storage::path($image->paths['large']));
        $this->assertFileDoesNotExist(Storage::path($image->paths['medium']));
        $this->assertFileDoesNotExist(Storage::path($image->paths['small']));
    }

    public function test投稿データを返す()
    {
        $user = User::factory()->create();
        $post = Post::factory()->create([
            'user_id' => $user->id,
        ]);
        Sanctum::actingAs($user);

        $this->putJson("/api/posts/{$post->id}", $this->input)
            ->assertSuccessful()
            ->assertJsonPath('id', $post->id);
    }
}
