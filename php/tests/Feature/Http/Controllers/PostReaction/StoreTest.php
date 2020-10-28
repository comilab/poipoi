<?php

namespace Tests\Feature\Http\Controllers\PostReaction;

use App\Models\Post;
use App\Models\User;
use App\Services\Setting;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
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

        $this->app->make(Setting::class)->fake();

        $this->input = [
            'emoji' => $this->faker->emoji,
        ];
    }

    public function test非公開の投稿ならエラー()
    {
        $post = Post::factory()->private()->create([
            'enable_reaction' => true,
        ]);

        $this->postJson("/api/posts/{$post->id}/reactions", $this->input)
            ->assertForbidden();
    }

    public function testリアクションを受け付けない投稿ならエラー()
    {
        $post = Post::factory()->public()->create([
            'enable_reaction' => false,
        ]);

        $this->postJson("/api/posts/{$post->id}/reactions", $this->input)
            ->assertForbidden();
    }

    public function test自分の投稿なら非公開でもOK()
    {
        $user = User::factory()->create();
        $post = Post::factory()->private()->create([
            'user_id' => $user->id,
            'allowed_emojis' => [],
            'denied_emojis' => [],
        ]);
        Sanctum::actingAs($user);

        $this->postJson("/api/posts/{$post->id}/reactions", $this->input)
            ->assertSuccessful();
    }

    public function test自分の投稿ならリアクションを受け付けてなくてもOK()
    {
        $user = User::factory()->create();
        $post = Post::factory()->public()->create([
            'user_id' => $user->id,
            'enable_reaction' => false,
            'allowed_emojis' => [],
            'denied_emojis' => [],
        ]);
        Sanctum::actingAs($user);

        $this->postJson("/api/posts/{$post->id}/reactions", $this->input)
            ->assertSuccessful();
    }

    public function testリアクションが保存される()
    {
        $post = Post::factory()->public()->create([
            'enable_reaction' => true,
            'allowed_emojis' => [],
            'denied_emojis' => [],
        ]);

        $this->postJson("/api/posts/{$post->id}/reactions", $this->input)
            ->assertSuccessful();

        $this->assertSame(1, $post->reactions()->count());

        $reaction = $post->reactions()->first();

        $this->assertSame($post->id, $reaction->post_id);
        $this->assertSame($this->input['emoji'], $reaction->emoji);
    }

    public function testリアクションデータを返す()
    {
        $post = Post::factory()->public()->create([
            'enable_reaction' => true,
            'allowed_emojis' => [],
            'denied_emojis' => [],
        ]);

        $response = $this->postJson("/api/posts/{$post->id}/reactions", $this->input)
            ->assertSuccessful();

        $reaction = $post->reactions()->first();

        $response->assertJsonPath('id', $reaction->id);
    }
}
