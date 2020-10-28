<?php

namespace Tests\Feature\Http\Controllers\Post;

use App\Models\Image;
use App\Models\Post;
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
     * @var \App\Services\Setting
     */
    protected $setting;

    protected function setUp(): void
    {
        parent::setUp();

        $this->setting = $this->app->make(Setting::class)->fake();
    }

    public function test投稿をsettingのperPage件返す()
    {
        Post::factory()->count($this->setting->get('perPage') + 1)->public()->create();

        $this->getJson('/api/posts')
            ->assertJsonCount($this->setting->get('perPage'), 'data');
    }

    public function test第一ソートキーはpinned()
    {
        $this->setting->set('perPage', 2, false);

        $post1 = Post::factory()->public()->create([
            'pinned' => true,
        ]);
        $post2 = Post::factory()->public()->create([
            'pinned' => false,
        ]);

        $this->getJson('/api/posts')
            ->assertJsonPath('data.0.id', $post1->id)
            ->assertJsonPath('data.1.id', $post2->id);
    }

    public function test第二ソートキーはcreated_atの降順()
    {
        $this->setting->set('perPage', 2, false);

        $post1 = Post::factory()->public()->create([
            'pinned' => false,
            'created_at' => $this->faker->dateTime(),
        ]);
        $post2 = Post::factory()->public()->create([
            'pinned' => false,
            'created_at' => Carbon::make($post1->created_at)->addSecond(),
        ]);

        $this->getJson('/api/posts')
            ->assertJsonPath('data.0.id', $post2->id)
            ->assertJsonPath('data.1.id', $post1->id);
    }

    public function testログインしていない場合は非公開の投稿は除外()
    {
        Post::factory()->private()->create();

        $this->getJson('/api/posts')
            ->assertJsonCount(0, 'data');
    }

    public function testログインしている場合は非公開の投稿も返す()
    {
        Sanctum::actingAs(User::factory()->create());
        Post::factory()->private()->create();

        $this->getJson('/api/posts')
            ->assertJsonCount(1, 'data');
    }

    public function testキーワードが指定されていれば絞り込みを行う()
    {
        $this->setting->set('perPage', 2, false);

        $post1 = Post::factory()->public()->create([
            'caption' => 'hoge',
        ]);
        $post2 = Post::factory()->public()->create([
            'caption' => 'fuga',
        ]);

        $this->getJson("/api/posts?keyword=hoge")
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $post1->id);
    }

    public function testImagesCountがセットされている()
    {
        $imagesCount = $this->faker->randomDigitNotNull;

        $post = Post::factory()->public()->create();
        Image::factory()->count($imagesCount)->create([
            'post_id' => $post->id,
        ]);

        $this->getJson('/api/posts')
            ->assertJsonPath('data.0.imagesCount', $imagesCount);
    }

    public function testShowThumbnailがtrueなら画像を1件だけセット()
    {
        $post = Post::factory()->public()->create([
            'show_thumbnail' => true,
        ]);
        $image1 = Image::factory()->create([
            'post_id' => $post->id,
            'weight' => $this->faker->randomDigit,
        ]);
        $image2 = Image::factory()->create([
            'post_id' => $post->id,
            'weight' => $image1->weight + 1,
        ]);

        $this->getJson('/api/posts')
            ->assertJsonCount(1, 'data.0.images')
            ->assertJsonPath('data.0.images.0.id', $image1->id);
    }

    public function testShowThumbnailがfalseなら画像はセットしない()
    {
        $post = Post::factory()->public()->create([
            'show_thumbnail' => false,
        ]);
        Image::factory()->create([
            'post_id' => $post->id,
        ]);

        $this->getJson('/api/posts')
            ->assertJsonCount(0, 'data.0.images');
    }
}
