<?php

namespace Tests\Feature\Http\Controllers\PostReaction;

use App\Models\Post;
use App\Models\Reaction;
use App\Models\User;
use App\Services\Setting;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Illuminate\Support\Carbon;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class IndexTest extends TestCase
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
            'lt' => $this->faker->dateTime()->format('Y-m-d\TH:i:s.v\Z'),
        ];
    }

    protected function buildQuery(array $data)
    {
        return http_build_query($data);
    }

    public function test非公開の投稿ならエラー()
    {
        $post = Post::factory()->private()->create([
            'enable_reaction' => true,
        ]);

        $this->getJson("/api/posts/{$post->id}/reactions?{$this->buildQuery($this->input)}")
            ->assertForbidden();
    }

    public function testリアクションを受け付けない投稿ならエラー()
    {
        $post = Post::factory()->public()->create([
            'enable_reaction' => false,
        ]);
        Reaction::factory()->create([
            'post_id' => $post->id,
            'created_at' => $this->faker->dateTime($this->input['lt']),
        ]);

        $this->getJson("/api/posts/{$post->id}/reactions?{$this->buildQuery($this->input)}")
            ->assertForbidden();
    }

    public function test自分の投稿なら非公開でもOK()
    {
        $user = User::factory()->create();
        $post = Post::factory()->private()->create([
            'user_id' => $user->id,
        ]);
        Sanctum::actingAs($user);

        $this->getJson("/api/posts/{$post->id}/reactions?{$this->buildQuery($this->input)}")
            ->assertSuccessful();
    }

    public function test自分の投稿ならリアクションを受け付けてなくてもOK()
    {
        $user = User::factory()->create();
        $post = Post::factory()->public()->create([
            'user_id' => $user->id,
            'enable_reaction' => false,
        ]);
        Sanctum::actingAs($user);

        $this->getJson("/api/posts/{$post->id}/reactions?{$this->buildQuery($this->input)}")
            ->assertSuccessful();
    }

    public function test指定日時より前に作成されたリアクションデータを100件返す()
    {
        $post = Post::factory()->public()->create([
            'enable_reaction' => true,
        ]);
        Reaction::factory()->count(101)->create([
            'post_id' => $post->id,
            'created_at' => $this->faker->dateTime($this->input['lt']),
        ]);

        $this->getJson("/api/posts/{$post->id}/reactions?{$this->buildQuery($this->input)}")
            ->assertSuccessful()
            ->assertJsonCount(100, 'data');
    }

    public function test指定日時以降のリアクションデータは返さない()
    {
        $post = Post::factory()->public()->create([
            'enable_reaction' => true,
        ]);
        Reaction::factory()->create([
            'post_id' => $post->id,
            'created_at' => Carbon::parse($this->input['lt']),
        ]);

        $this->getJson("/api/posts/{$post->id}/reactions?{$this->buildQuery($this->input)}")
            ->assertSuccessful()
            ->assertJsonCount(0, 'data');
    }

    public function test投稿と無関係のリアクションデータは返さない()
    {
        $post = Post::factory()->public()->create([
            'enable_reaction' => true,
        ]);
        Reaction::factory()->create([
            'created_at' => $this->faker->dateTime($this->input['lt']),
        ]);

        $this->getJson("/api/posts/{$post->id}/reactions?{$this->buildQuery($this->input)}")
            ->assertSuccessful()
            ->assertJsonCount(0, 'data');
    }

    public function test第一ソートキーはcreated_atの降順()
    {
        $post = Post::factory()->public()->create([
            'enable_reaction' => true,
        ]);
        $reaction1 = Reaction::factory()->create([
            'post_id' => $post->id,
            'created_at' => $this->faker->dateTime($this->input['lt']),
        ]);
        $reaction2 = Reaction::factory()->create([
            'post_id' => $post->id,
            'created_at' => $this->faker->dateTime($reaction1->created_at),
        ]);

        $this->getJson("/api/posts/{$post->id}/reactions?{$this->buildQuery($this->input)}")
            ->assertSuccessful()
            ->assertJsonCount(2, 'data')
            ->assertJsonPath('data.0.id', $reaction1->id)
            ->assertJsonPath('data.1.id', $reaction2->id);
    }
}
