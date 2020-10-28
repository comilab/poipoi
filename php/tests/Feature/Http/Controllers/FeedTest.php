<?php

namespace Tests\Feature\Http\Controllers;

use App\Models\Image;
use App\Models\Post;
use App\Services\Setting;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class FeedTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    /**
     * @var \App\Services\Setting
     */
    protected $setting;

    protected function setUp(): void
    {
        parent::setUp();

        $this->setting = $this->app->make(Setting::class)->fake([
            'enableFeed' => true,
        ]);
    }

    public function testRss配信が無効なら404()
    {
        $this->setting->set('enableFeed', false);

        $this->get('/feed')
            ->assertNotFound();
    }

    public function test投稿を20件取得()
    {
        Post::factory()->count(21)->public()->create();

        $response = $this->get('/feed')
            ->assertSuccessful();

        $this->assertCount(20, $response['posts']);
    }

    public function test第一ソートキーはcreated_atの降順()
    {
        $post1 = Post::factory()->public()->create([
            'created_at' => $this->faker->dateTime(),
        ]);
        $post2 = Post::factory()->public()->create([
            'created_at' => $this->faker->dateTime($post1->created_at),
        ]);

        $this->get('/feed')
            ->assertSuccessful()
            ->assertViewHas('posts.0.id', $post1->id)
            ->assertViewHas('posts.1.id', $post2->id);
    }

    public function test非公開の投稿は取得しない()
    {
        Post::factory()->private()->create();

        $response = $this->get('/feed')
            ->assertSuccessful();

        $this->assertCount(0, $response['posts']);
    }

    public function testサイトタイトルがセットされる()
    {
        $this->get('/feed')
            ->assertSuccessful()
            ->assertSee("<title>{$this->setting->get('siteTitle')}</title>", false);
    }

    public function testUrlがセットされる()
    {
        $this->get('/feed')
            ->assertSuccessful()
            ->assertSee('<link>' . url('/') . '</link>', false);
    }

    public function testサイト概要がセットされる()
    {
        $this->get('/feed')
            ->assertSuccessful()
            ->assertSee("<description>{$this->setting->get('siteDescription')}</description>", false);
    }

    public function test最終更新日がセットされる()
    {
        $post = Post::factory()->public()->create();

        $this->get('/feed')
            ->assertSuccessful()
            ->assertSee("<lastBuildDate>{$post->created_at->toRfc7231String()}</lastBuildDate>", false);
    }

    public function test投稿タイトルがセットされる()
    {
        $post = Post::factory()->public()->create();

        $this->get('/feed')
            ->assertSuccessful()
            ->assertSee("<title>{$post->title}</title>", false);
    }

    public function test投稿タイトルがない場合はキャプションをセット()
    {
        $post = Post::factory()->public()->create([
            'title' => '',
        ]);

        $this->get('/feed')
            ->assertSuccessful()
            ->assertSee("<title>{$post->caption}</title>", false);
    }

    public function test投稿Urlがセットされる()
    {
        $post = Post::factory()->public()->create();

        $this->get('/feed')
            ->assertSuccessful()
            ->assertSee("<link>{$post->url}</link>", false)
            ->assertSee("<guid>{$post->url}</guid>", false);
    }

    public function test投稿日がセットされる()
    {
        $post = Post::factory()->public()->create();

        $this->get('/feed')
            ->assertSuccessful()
            ->assertSee("<pubDate>{$post->created_at->toRfc7231String()}</pubDate>", false);
    }

    public function testキャプションがセットされる()
    {
        $post = Post::factory()->public()->create();

        $this->get('/feed')
            ->assertSuccessful()
            ->assertSee("<p>{$post->caption}</p>", false);
    }

    public function test画像があれば最初の1枚がセットされる()
    {
        $post = Post::factory()->public()->create([
            'show_thumbnail' => true,
        ]);
        $image1 = Image::factory()->create([
            'post_id' => $post->id,
            'weight' => 0,
        ]);
        $image2 = Image::factory()->create([
            'post_id' => $post->id,
            'weight' => 1,
        ]);

        $this->get('/feed')
            ->assertSuccessful()
            ->assertSee('<img src="' . url($image1->public_paths['small']) . '" />', false);
    }

    public function testサムネイル非表示設定の場合は画像をセットしない()
    {
        $post = Post::factory()->public()->create([
            'show_thumbnail' => false,
        ]);
        $image = Image::factory()->create([
            'post_id' => $post->id,
        ]);

        $this->get('/feed')
            ->assertSuccessful()
            ->assertDontSee('<img src="' . url($image->public_paths['small']) . '" />', false);
    }
}
