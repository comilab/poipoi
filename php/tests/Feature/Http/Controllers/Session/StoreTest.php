<?php

namespace Tests\Feature\Http\Controllers\Session;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class StoreTest extends TestCase
{
    use RefreshDatabase;

    public function dataメールアドレスかパスワードが間違っていたらエラー()
    {
        return [
            'メールアドレスが違う' => [ [
                'email' => 'invalid@example.com',
                'password' => 'password',
                'device_name' => 'device_name',
            ] ],
            'パスワードが違う' => [ [
                'email' => 'hoge@example.com',
                'password' => 'hogehoge',
                'device_name' => 'device_name',
            ] ],
        ];
    }

    /**
     * @dataProvider dataメールアドレスかパスワードが間違っていたらエラー
     */
    public function testメールアドレスかパスワードが間違っていたらエラー(array $input)
    {
        User::factory()->create([
            'email' => 'hoge@example.com',
        ]);

        $this->postJson('/api/sessions', $input)
            ->assertUnauthorized();
    }

    public function test入力データが正しければログインする()
    {
        $user = User::factory()->create();

        $this->postJson('/api/sessions', [
            'email' => $user->email,
            'password' => 'password',
            'device_name' => 'device_name',
        ])
            ->assertOk();

        $this->assertAuthenticated();
    }

    public function testログイン成功時にトークンを返す()
    {
        $user = User::factory()->create();

        $this->postJson('/api/sessions', [
            'email' => $user->email,
            'password' => 'password',
            'device_name' => 'device_name',
        ])
            ->assertJsonStructure(['token']);
    }

    public function test既にあるトークンを削除する()
    {
        $user = User::factory()->create();
        $user->createToken('device_name');

        $this->postJson('/api/sessions', [
            'email' => $user->email,
            'password' => 'password',
            'device_name' => 'device_name',
        ]);

        $this->assertSame(1, $user->tokens()->count());
    }
}
