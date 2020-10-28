<?php

namespace Tests\Feature\Http\Controllers\Post;

use App\Models\Image;
use App\Models\Post;
use App\Models\Tag;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class DestroyTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Storage::fake();
    }

    public function testログインしていなければエラー()
    {
        $post = Post::factory()->create();

        $this->deleteJson("/api/posts/{$post->id}")
            ->assertUnauthorized();
    }

    public function test自分の投稿でなければエラー()
    {
        $user = User::factory()->create();
        $post = Post::factory()->create();
        Sanctum::actingAs($user);

        $this->deleteJson("/api/posts/{$post->id}")
            ->assertForbidden();
    }

    public function test投稿が削除される()
    {
        $user = User::factory()->create();
        $post = Post::factory()->create([
            'user_id' => $user->id,
        ]);
        Sanctum::actingAs($user);

        $this->deleteJson("/api/posts/{$post->id}")
            ->assertSuccessful();

        $this->assertEmpty(Post::find($post->id));
    }

    public function test未使用となったタグが削除される()
    {
        $user = User::factory()->create();
        $post = Post::factory()->create([
            'user_id' => $user->id,
        ]);
        $tag = Tag::factory()->create();
        $post->tags()->attach([$tag->id]);
        Sanctum::actingAs($user);

        $this->deleteJson("/api/posts/{$post->id}")
            ->assertSuccessful();

        $this->assertEmpty(Tag::find($tag->id));
    }

    public function test他の投稿で使用されているタグは削除されない()
    {
        $user = User::factory()->create();
        $post = Post::factory()->create([
            'user_id' => $user->id,
        ]);
        $post2 = Post::factory()->create();
        $tag = Tag::factory()->create();
        $post->tags()->attach([$tag->id]);
        $post2->tags()->attach([$tag->id]);
        Sanctum::actingAs($user);

        $this->deleteJson("/api/posts/{$post->id}")
            ->assertSuccessful();

        $this->assertNotEmpty(Tag::find($tag->id));
    }

    public function test画像が削除される()
    {
        $user = User::factory()->create();
        $post = Post::factory()->create([
            'user_id' => $user->id,
        ]);
        $image = Image::factory()->withActualFile()->create([
            'post_id' => $post->id,
        ]);
        Sanctum::actingAs($user);

        $this->deleteJson("/api/posts/{$post->id}")
            ->assertSuccessful();

        $this->assertEmpty(Image::find($image->id));
        $this->assertDirectoryDoesNotExist(Storage::path($post->images_dir));
    }
}
