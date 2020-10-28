<?php

namespace Tests\Feature\Models;

use App\Models\Post;
use App\Models\Reaction;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class UserTest extends TestCase
{
    use RefreshDatabase;

    public function testFillable()
    {
        $user = new User();

        $this->assertTrue($user->isFillable('name'));
        $this->assertTrue($user->isFillable('email'));
    }

    public function testCasts()
    {
        $user = new User();

        $this->assertTrue($user->hasCast('email_verified_at', 'datetime'));
    }

    /**
     * @group relation
     */
    public function testRelation_posts()
    {
        $user = User::factory()->create();
        $posts = Post::factory()->count(2)->create([
            'user_id' => $user->id,
        ]);

        $this->assertCount(2, $user->posts);
        $this->assertCount(0, $user->posts->diff($posts));
    }

    /**
     * @group relation
     */
    public function testRelation_reactions()
    {
        $user = User::factory()->create();
        $post = Post::factory()->create([
            'user_id' => $user->id,
        ]);
        $reactions = Reaction::factory()->count(2)->create([
            'post_id' => $post->id,
        ]);

        $this->assertCount(2, $user->reactions);
        $this->assertCount(0, $user->reactions->diff($reactions));
    }
}
