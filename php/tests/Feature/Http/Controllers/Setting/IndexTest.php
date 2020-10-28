<?php

namespace Tests\Feature\Http\Controllers\Setting;

use App\Http\Resources\Setting as ResourcesSetting;
use App\Services\Setting;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class IndexTest extends TestCase
{
    use RefreshDatabase;

    /**
     * @var \App\Services\Setting
     */
    protected $setting;

    protected function setUp(): void
    {
        parent::setUp();

        $this->setting = $this->app->make(Setting::class)->fake();
    }

    public function testOk()
    {
        $this->getJson('/api/settings')
            ->assertOk()
            ->assertSee(ResourcesSetting::make($this->setting->all())->toJson(), false);
    }
}
