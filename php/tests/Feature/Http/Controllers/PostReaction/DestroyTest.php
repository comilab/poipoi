<?php

namespace Tests\Feature\Http\Controllers\PostReaction;

use App\Models\Post;
use App\Models\Reaction;
use App\Models\User;
use App\Services\Setting;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class DestroyTest extends TestCase
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
    }

    public function testログインしてなければエラー()
    {
        $post = Post::factory()->create();
        $reaction = Reaction::factory()->create([
            'post_id' => $post->id,
        ]);

        $this->deleteJson("/api/posts/{$post->id}/reactions/{$reaction->id}")
            ->assertUnauthorized();
    }

    public function test自分の投稿でなければエラー()
    {
        $user = User::factory()->create();
        $post = Post::factory()->create();
        $reaction = Reaction::factory()->create([
            'post_id' => $post->id,
        ]);
        Sanctum::actingAs($user);

        $this->deleteJson("/api/posts/{$post->id}/reactions/{$reaction->id}")
            ->assertForbidden();
    }

    public function testリアクションを削除する()
    {
        $user = User::factory()->create();
        $post = Post::factory()->create([
            'user_id' => $user->id,
        ]);
        $reaction = Reaction::factory()->create([
            'post_id' => $post->id,
        ]);
        Sanctum::actingAs($user);

        $this->deleteJson("/api/posts/{$post->id}/reactions/{$reaction->id}")
            ->assertSuccessful();

        $this->assertEmpty(Reaction::find($reaction->id));
    }
}
