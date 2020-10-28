<?php

namespace Tests\Feature\Http\Controllers\Notification;

use App\Models\Image;
use App\Models\Reaction;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Illuminate\Support\Carbon;
use Laravel\Sanctum\Sanctum;
use SettingSeeder;
use Tests\TestCase;

class IndexTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(SettingSeeder::class);
    }

    public function testログインしていなければエラー()
    {
        $this->getJson('/api/notifications')
            ->assertUnauthorized();
    }

    public function testログインしていればOK()
    {
        Sanctum::actingAs(User::factory()->create());

        $this->getJson('/api/notifications')
            ->assertOk();
    }

    public function testリアクションを15件返す()
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        Reaction::factory()->count(16)->create();

        $this->getJson('/api/notifications')
            ->assertJsonCount(15, 'data');
    }

    public function test第一ソートキーはcreated_atの降順()
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $reaction1 = Reaction::factory()->create([
            'created_at' => $this->faker->dateTime(),
        ]);
        $reaction2 = Reaction::factory()->create([
            'created_at' => Carbon::make($reaction1->created_at)->addSecond(),
        ]);

        $this->getJson('/api/notifications')
            ->assertJsonPath('data.0.id', $reaction2->id)
            ->assertJsonPath('data.1.id', $reaction1->id);
    }

    public function testリアクション元の投稿データがセットされている()
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $reaction = Reaction::factory()->create();

        $this->getJson('/api/notifications')
            ->assertJsonPath('data.0.post.id', $reaction->post_id);
    }

    public function testリアクション元の投稿に画像があれば1件だけセット()
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $reaction = Reaction::factory()->create();
        $image1 = Image::factory()->create([
            'post_id' => $reaction->post_id,
            'weight' => $this->faker->randomNumber(),
        ]);
        $image2 = Image::factory()->create([
            'post_id' => $reaction->post_id,
            'weight' => $image1->weight + 1,
        ]);

        $this->getJson('/api/notifications')
            ->assertJsonCount(1, 'data.0.post.images')
            ->assertJsonPath('data.0.post.images.0.id', $image1->id);
    }
}
