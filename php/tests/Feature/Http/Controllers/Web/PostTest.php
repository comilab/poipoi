<?php

namespace Tests\Feature\Http\Controllers\Web;

use App\Models\Image;
use App\Models\Post;
use App\Services\Setting;
use App\Services\SpaView;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Illuminate\Support\Facades\Storage;
use Mockery;
use Tests\TestCase;

class PostTest extends TestCase
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

        $this->instance(SpaView::class, Mockery::mock(SpaView::class, [$this->setting], function ($mock) {
            $mock
                ->makePartial()
                ->shouldAllowMockingProtectedMethods()
                ->shouldReceive('load')
                ->andReturn($this->faker->randomHtml());
        }));
    }

    public function testOk()
    {
        $post = Post::factory()->public()->create();

        $this->get("/posts/{$post->id}")
            ->assertOk();
    }

    public function test非公開なら404を返す()
    {
        $post = Post::factory()->create([
            'scope' => 'private',
        ]);

        $this->get("/posts/{$post->id}")
            ->assertNotFound();
    }

    public function test公開期間外なら404を返す()
    {
        $post = Post::factory()->outsideOfPeriod()->create();

        $this->get("/posts/{$post->id}")
            ->assertNotFound();
    }

    public function testTitleがセットされる()
    {
        $post = Post::factory()->public()->create();

        $this->get("/posts/{$post->id}")
            ->assertSee("<title>{$post->title} - {$this->setting->get('siteTitle')}</title>", false);

    }

    public function testDescriptionとしてキャプションがセットされる()
    {
        $post = Post::factory()->public()->create();

        $this->get("/posts/{$post->id}")
            ->assertSee('name="description" content="' . $post->caption.  '"', false);
    }

    public function testDenyRobotがtrueなら検索避けタグがセットされる()
    {
        $post = Post::factory()->public()->create([
            'deny_robot' => true,
        ]);

        $this->get("/posts/{$post->id}")
            ->assertSee('name="robots" content="noindex, nofollow, noarchive"', false);
    }

    public function testDenyRobotがfalseなら検索避けタグがセットされない()
    {
        $post = Post::factory()->public()->create([
            'deny_robot' => false,
        ]);

        $this->get("/posts/{$post->id}")
            ->assertDontSee('name="robots" content="noindex, nofollow, noarchive"', false);
    }

    public function testEnableTwitterShareがtrueならTwitterカード用タグがセットされる()
    {
        $post = Post::factory()->public()->create([
            'enable_twitter_share' => true,
        ]);

        $this->get("/posts/{$post->id}")
            ->assertSee('property="og:url" content="' . $post->url . '"', false)
            ->assertSee('property="og:title" content="' . "{$post->title} - {$this->setting->get('siteTitle')}" . '"', false)
            ->assertSee('property="og:description" content="' . $post->caption . '"', false);
    }

    public function test画像があればTwitterカードで表示する()
    {
        Storage::fake();

        $post = Post::factory()->public()->create([
            'enable_twitter_share' => true,
            'show_thumbnail' => true,
        ]);
        $image = Image::factory()->create([
            'post_id' => $post->id,
        ]);

        $this->get("/posts/{$post->id}")
            ->assertSee('name="twitter:card" content="summary_large_image"', false)
            ->assertSee('property="og:image" content="' . url($post->images[0]->public_paths['medium']) . '"', false);
    }

    public function test画像がなければTwitterカードはsummaryのみ()
    {
        $post = Post::factory()->public()->create([
            'enable_twitter_share' => true,
            'show_thumbnail' => true,
        ]);

        $this->get("/posts/{$post->id}")
            ->assertSee('name="twitter:card" content="summary"', false)
            ->assertDontSee('property="og:image"', false);
    }

    public function testShowThumbnailがfalseなら画像があってもTwitterカードで表示しない()
    {
        Storage::fake();

        $post = Post::factory()->public()->create([
            'enable_twitter_share' => true,
            'show_thumbnail' => false,
        ]);
        $image = Image::factory()->create([
            'post_id' => $post->id,
        ]);

        $this->get("/posts/{$post->id}")
            ->assertSee('name="twitter:card" content="summary"', false)
            ->assertDontSee('property="og:image"', false);
    }

    public function testTitleが空の場合は代わりにキャプションがセットされる()
    {
        $post = Post::factory()->public()->create([
            'title' => '',
            'enable_twitter_share' => true,
        ]);

        $this->get("/posts/{$post->id}")
            ->assertSee("<title>{$post->caption} - {$this->setting->get('siteTitle')}</title>", false)
            ->assertSee('property="og:title" content="' . "{$post->caption} - {$this->setting->get('siteTitle')}" . '"', false);
    }
}
