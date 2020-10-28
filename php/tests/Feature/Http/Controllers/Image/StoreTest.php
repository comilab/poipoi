<?php

namespace Tests\Feature\Http\Controllers\Image;

use App\Http\Requests\StoreImage;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class StoreTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    /**
     * @var array
     */
    protected $input;

    protected function setUp(): void
    {
        parent::setUp();

        Storage::fake();

        $this->input = [
            'file' => UploadedFile::fake()->image('fake.jpg'),
        ];

        $this->partialMock(StoreImage::class, function ($mock) {
            $mock->shouldAllowMockingProtectedMethods();
            $mock
                ->shouldReceive('file')
                ->andReturn($this->input['file']);
            $mock
                ->shouldReceive('resize')
                ->andReturnUsing(function ($from, $to) {
                    copy($from, $to);
                });
        });
    }

    public function testログインしていなければエラー()
    {
        $this->postJson('/api/images', $this->input)
            ->assertUnauthorized();
    }

    public function test画像の一時ファイル名を返す()
    {
        Sanctum::actingAs(User::factory()->create());

        $this->postJson('/api/images', $this->input)
            ->assertSuccessful()
            ->assertSee("temp/{$this->input['file']->hashName()}");
    }

    public function test画像をリサイズする()
    {
        Sanctum::actingAs(User::factory()->create());

        $response = $this->postJson('/api/images', $this->input)
            ->assertSuccessful();

        $tempFile = $response->getContent();

        $this->assertFileExists(Storage::path($tempFile));
        $this->assertFileExists(Storage::path("{$tempFile}.large"));
        $this->assertFileExists(Storage::path("{$tempFile}.medium"));
        $this->assertFileExists(Storage::path("{$tempFile}.small"));
    }
}
