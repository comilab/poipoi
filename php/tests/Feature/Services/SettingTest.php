<?php

namespace Tests\Feature\Services;

use App\Services\Setting;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class SettingTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    public function test_fake()
    {
        $setting = $this->app->make(Setting::class);

        $this->assertEmpty($setting->all());

        $setting->fake();

        $this->assertNotEmpty($setting->all());
    }

    public function test_replace_引数のデータのみを置き換え()
    {
        $setting = $this->app->make(Setting::class)->fake();

        $oldTitle = $setting->get('siteTitle');
        $oldDescription = $setting->get('siteDescription');
        $newTitle = "{$oldTitle}_{$this->faker->word}";

        $setting->replace(['siteTitle' => $newTitle]);

        $this->assertEquals($newTitle, $setting->get('siteTitle'));
        $this->assertEquals($oldDescription, $setting->get('siteDescription'));
    }

    public function test_replace_fieldsにないキーは置き換えない()
    {
        $setting = $this->app->make(Setting::class)->fake();

        $setting->replace(['foo' => 'bar']);

        $this->assertArrayNotHasKey('foo', $setting->all());
    }

    public function test_replace_配列が正しく置換される()
    {
        $setting = $this->app->make(Setting::class)->fake();

        $oldScope = [];
        $setting->set('postDefault.denyRobotScope', $oldScope);
        $newScope = ['public'];

        $setting->replace(['postDefault.denyRobotScope' => $newScope]);

        $this->assertEquals($newScope, $setting->get('postDefault.denyRobotScope'));
    }
}
