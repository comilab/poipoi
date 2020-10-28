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

class VerifyTest extends TestCase
{
    use RefreshDatabase;

    /**
     * @var array
     */
    protected $input;

    protected function setUp(): void
    {
        parent::setUp();

        $this->app->make(Setting::class)->fake();

        $this->input = [
            'password' => 'password',
        ];
    }

    public function test非公開なら404()
    {
        $post = Post::factory()->private()->create();

        $this->postJson("/api/posts/{$post->id}/verify", $this->input)
            ->assertNotFound();
    }

    public function test非公開でも自分の投稿ならok()
    {
        $user = User::factory()->create();
        $post = Post::factory()->outsideOfPeriod()->create([
            'user_id' => $user->id,
            'scope' => 'password',
        ]);
        Sanctum::actingAs($user);

        $this->input['password'] = $post->password;

        $this->postJson("/api/posts/{$post->id}/verify", $this->input)
            ->assertSuccessful();
    }

    public function test公開範囲がパスワードでなければエラー()
    {
        $post = Post::factory()->public()->create([
            'scope' => 'public',
        ]);

        $this->postJson("/api/posts/{$post->id}/verify", $this->input)
            ->assertNotFound();
    }

    public function testパスワードが異なっていればエラー()
    {
        $post = Post::factory()->public()->create([
            'scope' => 'password',
        ]);

        $this->postJson("/api/posts/{$post->id}/verify", $this->input)
            ->assertUnauthorized();
    }

    public function testパスワードが一致していれば投稿データを返す()
    {
        $post = Post::factory()->public()->create([
            'scope' => 'password',
        ]);

        $this->input['password'] = $post->password;

        $this->postJson("/api/posts/{$post->id}/verify", $this->input)
            ->assertSuccessful()
            ->assertJsonPath('id', $post->id);
    }

    public function test画像データもセットされる()
    {
        $post = Post::factory()->public()->create([
            'scope' => 'password',
        ]);
        $image = Image::factory()->create([
            'post_id' => $post->id,
        ]);

        $this->input['password'] = $post->password;

        $this->postJson("/api/posts/{$post->id}/verify", $this->input)
            ->assertSuccessful()
            ->assertJsonCount(1, 'images')
            ->assertJsonPath('images.0.id', $image->id);
    }

    public function testリアクションデータもセットされる()
    {
        $post = Post::factory()->public()->create([
            'scope' => 'password',
            'enable_reaction' => true,
        ]);
        $reaction = Reaction::factory()->create([
            'post_id' => $post->id,
        ]);

        $this->input['password'] = $post->password;

        $this->postJson("/api/posts/{$post->id}/verify", $this->input)
            ->assertSuccessful()
            ->assertJsonCount(1, 'reactions')
            ->assertJsonPath('reactions.0.id', $reaction->id)
            ->assertJsonPath('reactionsCount', 1);
    }

    public function testリアクションを受け付けない場合はリアクションデータを返さない()
    {
        $post = Post::factory()->public()->create([
            'scope' => 'password',
            'enable_reaction' => false,
        ]);
        Reaction::factory()->create([
            'post_id' => $post->id,
        ]);

        $this->input['password'] = $post->password;

        $this->postJson("/api/posts/{$post->id}/verify", $this->input)
            ->assertJsonPath('reactions', null)
            ->assertJsonPath('reactionsCount', null);
    }
}
