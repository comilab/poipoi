<?php

namespace Tests\Feature\Http\Controllers\Session;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class DestroyTest extends TestCase
{
    use RefreshDatabase;

    public function testログアウトする()
    {
        Sanctum::actingAs(User::factory()->create());

        $this->deleteJson('/api/sessions/device_name')
            ->assertOk();

        $this->assertGuest('web');
    }

    public function testトークンを全て削除する()
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $this->deleteJson('/api/sessions/device_name');

        $this->assertSame(0, $user->tokens()->count());
    }
}
