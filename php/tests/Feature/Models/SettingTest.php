<?php

namespace Tests\Feature\Models;

use App\Models\Setting;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class SettingTest extends TestCase
{
    public function testCasts()
    {
        $setting = new Setting();

        $this->assertTrue($setting->hasCast('data', 'array'));
    }
}
