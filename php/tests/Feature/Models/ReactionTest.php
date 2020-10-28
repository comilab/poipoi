<?php

namespace Tests\Feature\Models;

use App\Models\Post;
use App\Models\Reaction;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class ReactionTest extends TestCase
{
    use RefreshDatabase;

    public function test_fillable()
    {
        $reaction = new Reaction();

        $this->assertTrue($reaction->isFillable('emoji'));
    }

    public function test_casts()
    {
        $reaction = new Reaction();

        $this->assertTrue($reaction->hasCast('post_id', 'integer'));
    }

    /**
     * @group relation
     */
    public function testRelation_post()
    {
        $post = Post::factory()->create();
        $reaction = Reaction::factory()->create([
            'post_id' => $post,
        ]);

        $this->assertTrue($reaction->post->is($post));
    }
}
