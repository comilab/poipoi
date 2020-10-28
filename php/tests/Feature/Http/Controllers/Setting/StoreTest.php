<?php

namespace Tests\Feature\Http\Controllers\Setting;

use App\Http\Resources\Setting as ResourcesSetting;
use App\Models\User;
use App\Services\Setting;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class StoreTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    /**
     * @var \App\Services\Setting
     */
    protected $setting;

    /**
     * @var array
     */
    protected $input;

    protected function setUp(): void
    {
        parent::setUp();

        $this->setting = $this->app->make(Setting::class)->fake();

        $this->input = [
            'settings' => [
                'siteTitle' => $this->faker->word(),
                'siteDescription' => $this->faker->text(),
                'perPage' => $this->faker->randomDigitNotNull(),
                'denyRobot' => $this->faker->boolean(),
                'enableFeed' => $this->faker->boolean(),
                'postDefault' => [
                    'denyRobotScope' => $this->faker->randomElements(['public', 'password', 'nsfw', 'r18']),
                    'enableReaction' => $this->faker->boolean(),
                    'enableTwitterShare' => $this->faker->boolean(),
                    'allowedEmojis' => [$this->faker->emoji],
                    'deniedEmojis' => [$this->faker->emoji],
                ],
            ],
            'user' => [
                'name' => $this->faker->name,
                'email' => $this->faker->unique()->safeEmail,
                'password' => $this->faker->password,
            ],
        ];
    }

    public function testログインしていなければエラー()
    {
        $this->postJson('/api/settings', $this->input)
            ->assertUnauthorized();
    }

    public function test設定が保存される()
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $this->postJson('/api/settings', $this->input)
            ->assertOk();

        $input = $this->input['settings'];

        $this->assertSame($input['siteTitle'], $this->setting->get('siteTitle'));
        $this->assertSame($input['siteDescription'], $this->setting->get('siteDescription'));
        $this->assertSame($input['perPage'], $this->setting->get('perPage'));
        $this->assertSame($input['denyRobot'], $this->setting->get('denyRobot'));
        $this->assertSame($input['enableFeed'], $this->setting->get('enableFeed'));
        $this->assertEquals($input['postDefault']['denyRobotScope'], $this->setting->get('postDefault.denyRobotScope'));
        $this->assertSame($input['postDefault']['enableReaction'], $this->setting->get('postDefault.enableReaction'));
        $this->assertSame($input['postDefault']['enableTwitterShare'], $this->setting->get('postDefault.enableTwitterShare'));
        $this->assertEquals($input['postDefault']['allowedEmojis'], $this->setting->get('postDefault.allowedEmojis'));
        $this->assertEquals($input['postDefault']['deniedEmojis'], $this->setting->get('postDefault.deniedEmojis'));
    }

    public function testユーザデータが保存される()
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $this->postJson('/api/settings', $this->input)
            ->assertOk();

        $user->refresh();
        $input = $this->input['user'];

        $this->assertSame($input['name'], $user->name);
        $this->assertSame($input['email'], $user->email);
        $this->assertTrue(Hash::check($input['password'], $user->password));
    }

    public function testパスワードが空の場合は更新しない()
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        unset($this->input['user']['password']);

        $this->postJson('/api/settings', $this->input)
            ->assertOk();

        $newUser = $user->fresh();

        $this->assertSame($newUser->password, $user->password);
    }

    public function test設定データを返す()
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $this->postJson('/api/settings', $this->input)
            ->assertOk()
            ->assertSee(ResourcesSetting::make($this->setting->all())->toJson(), false);
    }
}
