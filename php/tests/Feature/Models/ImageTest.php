<?php

namespace Tests\Feature\Models;

use App\Models\Image;
use App\Models\Post;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ImageTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    protected function setUp(): void
    {
        parent::setUp();

        Storage::fake();
    }

    public function test_casts()
    {
        $image = new Image();

        $this->assertTrue($image->hasCast('post_id', 'integer'));
        $this->assertTrue($image->hasCast('weight', 'integer'));
    }

    /**
     * @group relation
     */
    public function test_relation_post()
    {
        $post = Post::factory()->create();
        $image = Image::factory()->create([
            'post_id' => $post->id,
        ]);

        $this->assertTrue($image->post->is($post));
    }

    /**
     * @group accessor
     */
    public function test_accessor_paths()
    {
        $image = Image::factory()->create([
            'extension' => 'png',
        ]);

        $this->assertIsArray($image->paths);
        $this->assertSame("public/images/{$image->post_id}/original_{$image->filename}.{$image->extension}", $image->paths['original']);
        $this->assertSame("public/images/{$image->post_id}/large_{$image->filename}.jpeg", $image->paths['large']);
        $this->assertSame("public/images/{$image->post_id}/medium_{$image->filename}.jpeg", $image->paths['medium']);
        $this->assertSame("public/images/{$image->post_id}/small_{$image->filename}.jpeg", $image->paths['small']);
    }

    /**
     * @group accessor
     */
    public function test_accessor_public_paths()
    {
        $image = Image::factory()->create();

        $this->assertIsArray($image->public_paths);
        $this->assertSame(Storage::url($image->paths['original']), $image->public_paths['original']);
        $this->assertSame(Storage::url($image->paths['large']), $image->public_paths['large']);
        $this->assertSame(Storage::url($image->paths['medium']), $image->public_paths['medium']);
        $this->assertSame(Storage::url($image->paths['small']), $image->public_paths['small']);
    }

    public function test_saveImage()
    {
        Storage::makeDirectory('temp');
        $tempPath = $this->faker->image(Storage::path('temp'), 10, 10, null, false);
        Storage::copy("temp/{$tempPath}", "temp/{$tempPath}.large");
        Storage::copy("temp/{$tempPath}", "temp/{$tempPath}.medium");
        Storage::copy("temp/{$tempPath}", "temp/{$tempPath}.small");

        $image = Image::factory()->create();

        $image->saveImage("temp/{$tempPath}");

        $this->assertFileExists(Storage::path($image->paths['original']));
        $this->assertFileExists(Storage::path($image->paths['large']));
        $this->assertFileExists(Storage::path($image->paths['medium']));
        $this->assertFileExists(Storage::path($image->paths['small']));
    }

    public function test_deleteImage()
    {
        $image = Image::factory()->withActualFile()->create();

        $image->deleteImage();

        $this->assertFileDoesNotExist(Storage::path($image->paths['original']));
        $this->assertFileDoesNotExist(Storage::path($image->paths['large']));
        $this->assertFileDoesNotExist(Storage::path($image->paths['medium']));
        $this->assertFileDoesNotExist(Storage::path($image->paths['small']));
    }
}
