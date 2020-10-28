<?php

namespace Tests\Feature\Models;

use App\Models\Post;
use App\Models\Tag;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class TagTest extends TestCase
{
    use RefreshDatabase;

    public function test_fillable()
    {
        $tag = new Tag();

        $this->assertTrue($tag->isFillable('name'));
    }

    /**
     * @group relation
     */
    public function test_relation_post()
    {
        $tag = Tag::factory()->create();
        $posts = Post::factory()->count(2)->create();
        $tag->posts()->attach($posts->pluck('id'));

        $this->assertCount(2, $tag->posts);
        $this->assertCount(0, $tag->posts->diff($posts));
    }

    public function test_clean()
    {
        $post = Post::factory()->create();
        $tag1 = Tag::factory()->create();
        $tag2 = Tag::factory()->create();
        $tag1->posts()->attach($post->id);

        Tag::clean();

        $this->assertNotEmpty(Tag::find($tag1->id));
        $this->assertEmpty(Tag::find($tag2->id));
    }
}
