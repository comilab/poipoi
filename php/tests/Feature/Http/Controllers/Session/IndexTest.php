<?php

namespace Tests\Feature\Http\Controllers\Session;

use App\Http\Resources\User as ResourcesUser;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class IndexTest extends TestCase
{
    use RefreshDatabase;

    public function testログインしていなければエラー()
    {
        $this->getJson('/api/sessions')
            ->assertUnauthorized();
    }

    public function testログインしていればOK()
    {
        Sanctum::actingAs(User::factory()->create());

        $this->getJson('/api/sessions')
            ->assertOk();
    }

    public function testユーザデータを返す()
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $this->getJson('/api/sessions')
            ->assertSee(ResourcesUser::make($user)->toJson(), false);
    }
}
