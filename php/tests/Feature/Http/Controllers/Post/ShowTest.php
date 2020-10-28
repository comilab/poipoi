<?php

namespace Tests\Feature\Http\Controllers\Post;

use App\Models\Image;
use App\Models\Post;
use App\Models\Reaction;
use App\Models\User;
use App\Services\Setting;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ShowTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->app->make(Setting::class)->fake();
    }

    public function test非公開なら404()
    {
        $post = Post::factory()->private()->create();

        $this->getJson("/api/posts/{$post->id}")
            ->assertNotFound();
    }

    public function test非公開でも自分の投稿ならok()
    {
        $user = User::factory()->create();
        $post = Post::factory()->private()->create([
            'user_id' => $user->id,
        ]);
        Sanctum::actingAs($user);

        $this->getJson("/api/posts/{$post->id}")
            ->assertOk();
    }

    public function testパスワード制なら画像・本文・リアクションを返さない()
    {
        $post = Post::factory()->public()->create([
            'scope' => 'password',
            'enable_reaction' => true,
        ]);
        Image::factory()->create([
            'post_id' => $post->id,
        ]);
        Reaction::factory()->create([
            'post_id' => $post->id,
        ]);

        $this->getJson("/api/posts/{$post->id}")
            ->assertJsonPath('text', null)
            ->assertJsonPath('images', null)
            ->assertJsonPath('reactions', null);
    }

    public function testパスワード制でも自分の投稿なら全てのデータを返す()
    {
        $user = User::factory()->create();
        $post = Post::factory()->public()->create([
            'user_id' => $user->id,
            'scope' => 'password',
            'enable_reaction' => true,
        ]);
        Image::factory()->create([
            'post_id' => $post->id,
        ]);
        Reaction::factory()->create([
            'post_id' => $post->id,
        ]);
        Sanctum::actingAs($user);

        $this->getJson("/api/posts/{$post->id}")
            ->assertJsonPath('text', $post->text)
            ->assertJsonCount(1, 'images')
            ->assertJsonCount(1, 'reactions');
    }

    public function testリアクションを受け付けない場合はリアクションデータを返さない()
    {
        $post = Post::factory()->public()->create([
            'scope' => 'public',
            'enable_reaction' => false,
        ]);
        Reaction::factory()->create([
            'post_id' => $post->id,
        ]);

        $this->getJson("/api/posts/{$post->id}")
            ->assertJsonPath('reactions', null)
            ->assertJsonPath('reactionsCount', null);
    }
}
