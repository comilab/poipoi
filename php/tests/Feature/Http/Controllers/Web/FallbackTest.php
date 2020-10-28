<?php

namespace Tests\Feature\Http\Controllers\Web;

use App\Services\Setting;
use App\Services\SpaView;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Mockery;
use Tests\TestCase;

class FallbackTest extends TestCase
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
        $this->get('/hoge')
            ->assertOk();
    }
}
