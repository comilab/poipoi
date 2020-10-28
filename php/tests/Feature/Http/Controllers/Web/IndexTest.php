<?php

namespace Tests\Feature\Http\Controllers\Web;

use App\Services\Setting;
use App\Services\SpaView;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Mockery;
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
        $this->get('/')
            ->assertOk();
    }

    public function testTitleがセットされる()
    {
        $this->get('/')
            ->assertSee("<title>{$this->setting->get('siteTitle')}</title>", false);
    }

    public function testDescriptionがセットされる()
    {
        $this->get('/')
            ->assertSee('name="description" content="' . $this->setting->get('siteDescription') . '"', false);
    }

    public function testDenyRobotがtrueなら検索避けタグがセットされる()
    {
        $this->setting->set('denyRobot', true);

        $this->get('/')
            ->assertSee('name="robots" content="noindex, nofollow, noarchive"', false);
    }

    public function testDenyRobotがfalseなら検索避けタグがセットされない()
    {
        $this->setting->set('denyRobot', false);

        $this->get('/')
            ->assertDontSee('name="robots" content="noindex, nofollow, noarchive"', false);
    }

    public function testEnableFeedがtrueならfeed配信用タグがセットされる()
    {
        $this->setting->set('enableFeed', true);

        $this->get('/')
            ->assertSee('rel="alternate" type="application/rss+xml" title="' . $this->setting->get('siteTitle') . '" href="'.url('/feed').'"', false);
    }

    public function testEnableFeedがfalseならfeed配信用タグがセットされない()
    {
        $this->setting->set('enableFeed', false);

        $this->get('/')
            ->assertDontSee('rel="alternate" type="application/rss+xml" title="' . $this->setting->get('siteTitle') . '" href="'.url('/feed').'"', false);
    }
}
