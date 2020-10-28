<?php

namespace Tests\Feature\Models;

use App\Models\Image;
use App\Models\Post;
use App\Models\Reaction;
use App\Models\Tag;
use App\Models\User;
use App\Services\Emoji;
use App\Services\Setting;
use Closure;
use Illuminate\Database\Eloquent\Factories\Sequence;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class PostTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    /**
     * @var \App\Services\Setting
     */
    protected $setting;

    protected function setUp(): void
    {
        parent::setUp();

        $this->setting = $this->app->make(Setting::class)->fake();
    }

    public function testFillable()
    {
        $post = new Post();

        $this->assertTrue($post->isFillable('title'));
        $this->assertTrue($post->isFillable('caption'));
        $this->assertTrue($post->isFillable('show_images_list'));
        $this->assertTrue($post->isFillable('text'));
        $this->assertTrue($post->isFillable('scope'));
        $this->assertTrue($post->isFillable('password'));
        $this->assertTrue($post->isFillable('publish_start'));
        $this->assertTrue($post->isFillable('publish_end'));
        $this->assertTrue($post->isFillable('rating'));
        $this->assertTrue($post->isFillable('pinned'));
        $this->assertTrue($post->isFillable('show_thumbnail'));
        $this->assertTrue($post->isFillable('deny_robot'));
        $this->assertTrue($post->isFillable('enable_reaction'));
        $this->assertTrue($post->isFillable('allowed_emojis'));
        $this->assertTrue($post->isFillable('denied_emojis'));
        $this->assertTrue($post->isFillable('enable_twitter_share'));
    }

    public function testCasts()
    {
        $post = new Post();

        $this->assertTrue($post->hasCast('user_id', 'integer'));
        $this->assertTrue($post->hasCast('show_images_list', 'boolean'));
        $this->assertTrue($post->hasCast('publish_start', 'datetime'));
        $this->assertTrue($post->hasCast('publish_end', 'datetime'));
        $this->assertTrue($post->hasCast('pinned', 'boolean'));
        $this->assertTrue($post->hasCast('show_thumbnail', 'boolean'));
        $this->assertTrue($post->hasCast('deny_robot', 'boolean'));
        $this->assertTrue($post->hasCast('enable_reaction', 'boolean'));
        $this->assertTrue($post->hasCast('allowed_emojis', 'collection'));
        $this->assertTrue($post->hasCast('denied_emojis', 'collection'));
        $this->assertTrue($post->hasCast('enable_twitter_share', 'boolean'));
    }

    /**
     * @group relation
     */
    public function testRelation_user()
    {
        $user = User::factory()->create();
        $post = Post::factory()->create([
            'user_id' => $user->id,
        ]);

        $this->assertTrue($post->user->is($user));
    }

    /**
     * @group relation
     */
    public function testRelation_images()
    {
        $post = Post::factory()->create();
        $images = Image::factory()->count(2)->create([
            'post_id' => $post->id,
        ]);

        $this->assertCount(2, $post->images);
        $this->assertCount(0, $post->images->diff($images));
    }

    /**
     * @group relation
     */
    public function testRelation_images_weight順にソート()
    {
        $post = Post::factory()->create();
        $image1 = Image::factory()->create([
            'post_id' => $post->id,
            'weight' => 0,
        ]);
        $image2 = Image::factory()->create([
            'post_id' => $post->id,
            'weight' => 1,
        ]);

        $this->assertTrue($post->images[0]->is($image1));
        $this->assertTrue($post->images[1]->is($image2));
    }

    /**
     * @group relation
     */
    public function testRelation_reactions()
    {
        $post = Post::factory()->create();
        $reactions = Reaction::factory()->count(2)->create([
            'post_id' => $post->id,
        ]);

        $this->assertCount(2, $post->reactions);
        $this->assertCount(0, $post->reactions->diff($reactions));
    }

    /**
     * @group relation
     */
    public function testRelation_reactions_作成日順にソート()
    {
        $post = Post::factory()->create();
        $reaction1 = Reaction::factory()->create([
            'post_id' => $post->id,
            'created_at' => $this->faker->dateTime(),
        ]);
        $reaction2 = Reaction::factory()->create([
            'post_id' => $post->id,
            'created_at' => $this->faker->dateTime($reaction1->created_at),
        ]);

        $this->assertTrue($post->reactions[0]->is($reaction1));
        $this->assertTrue($post->reactions[1]->is($reaction2));
    }

    /**
     * @group relation
     */
    public function testRelation_tags()
    {
        $post = Post::factory()->create();
        $tags = Tag::factory()
            ->count(2)
            ->state(new Sequence(
                ['name' => 'tag1'],
                ['name' => 'tag2'],
            ))
            ->create();
        $post->tags()->attach($tags->pluck('id'));

        $this->assertCount(2, $post->tags);
        $this->assertCount(0, $post->tags->diff($tags));
    }

    /**
     * @group accessor
     */
    public function testAccessor_url()
    {
        $post = Post::factory()->create();

        $this->assertSame(url("/posts/{$post->id}"), $post->url);
    }

    /**
     * @group accessor
     */
    public function testAccessor_textCount()
    {
        $length = $this->faker->numberBetween(1, 300000);
        $post = Post::factory()->create([
            'text' => $this->faker->realText($length),
        ]);

        $this->assertSame($length, $post->text_count);
    }

    /**
     * @group accessor
     */
    public function testAccessor_actualDenyRobot()
    {
        $post = Post::factory()->create([
            'deny_robot' => $this->faker->boolean(),
        ]);

        $this->assertSame($post->deny_robot, $post->actual_deny_robot);
    }

    public function dataAccessor_actualDenyRobot_nullならsettingの値から算出()
    {
        return [
            'scope = public, denyRobotScope = public' => [
                ['scope' => 'public'],
                ['public'],
                true,
            ],
            'scope = password, denyRobotScope = password' => [
                ['scope' => 'password'],
                ['password'],
                true,
            ],
            'rating = r18, denyRobotScope = r18' => [
                ['rating' => 'r18'],
                ['r18'],
                true,
            ],
            'rating = nsfw, denyRobotScope = nsfw' => [
                ['rating' => 'nsfw'],
                ['nsfw'],
                true,
            ],
            'denyRobotScope = none' => [
                [],
                [],
                false,
            ],
        ];
    }

    /**
     * @group accessor
     * @dataProvider dataAccessor_actualDenyRobot_nullならsettingの値から算出
     */
    public function testAccessor_actualDenyRobot_nullならsettingの値から算出(array $attributes, array $denyRobotScope, bool $result)
    {
        $post = Post::factory()->create($attributes + [
            'deny_robot' => null,
        ]);
        $this->setting->set('postDefault.denyRobotScope', $denyRobotScope, false);

        $this->assertSame($result, $post->actual_deny_robot);
    }

    /**
     * @group accessor
     */
    public function testAccessor_actualEnableReaction()
    {
        $post = Post::factory()->create([
            'enable_reaction' => $this->faker->boolean(),
        ]);

        $this->assertSame($post->enable_reaction, $post->actual_enable_reaction);
    }

    /**
     * @group accessor
     */
    public function testAccessor_actualEnableReaction_nullならsettingの値を返す()
    {
        $post = Post::factory()->create([
            'enable_reaction' => null,
        ]);

        $this->assertSame($this->setting->get('postDefault.enableReaction'), $post->actual_enable_reaction);
    }

    /**
     * @group accessor
     */
    public function testAccessor_actualAllowedEmojis()
    {
        $post = Post::factory()->create([
            'allowed_emojis' => $this->app->make(Emoji::class)->random(),
        ]);

        $this->assertCount(0, $post->actual_allowed_emojis->diff($post->allowed_emojis));
    }

    /**
     * @group accessor
     */
    public function testAccessor_actualAllowedEmojis_nullならsettingの値を返す()
    {
        $post = Post::factory()->create([
            'allowed_emojis' => null,
        ]);

        $this->assertCount(0, $post->actual_allowed_emojis->diff($this->setting->get('postDefault.allowedEmojis')));
    }

    /**
     * @group accessor
     */
    public function testAccessor_actualDeniedEmojis()
    {
        $post = Post::factory()->create([
            'denied_emojis' => $this->app->make(Emoji::class)->random(),
        ]);

        $this->assertCount(0, $post->actual_denied_emojis->diff($post->denied_emojis));
    }

    /**
     * @group accessor
     */
    public function testAccessor_actualDeniedEmojis_nullならsettingの値を返す()
    {
        $post = Post::factory()->create([
            'denied_emojis' => null,
        ]);

        $this->assertCount(0, $post->actual_denied_emojis->diff($this->setting->get('postDefault.deniedEmojis')));
    }

    public function dataAccessor_emojis()
    {
        return [
            'allowed_emojisがセットされている' => [
                ['allowed_emojis' => ['😇'], 'denied_emojis' => []],
                ['😇'],
            ],
            'denied_emojisがセットされている' => [
                ['allowed_emojis' => [], 'denied_emojis' => ['😇']],
                ['💯', '🍣'],
            ],
            '両方とも空' => [
                ['allowed_emojis' => [], 'denied_emojis' => []],
                [],
            ],
        ];
    }

    /**
     * @group accessor
     * @dataProvider dataAccessor_emojis
     */
    public function testAccessor_emojis(array $attributes, array $result)
    {
        $this->partialMock(Emoji::class, function ($mock) {
            $mock
                ->shouldReceive('all')
                ->andReturns(collect(['😇', '💯', '🍣']));
        });

        $post = Post::factory()->create($attributes);

        $this->assertCount(0, $post->emojis->diff($result));
    }

    /**
     * @group accessor
     */
    public function testAccessor_actualEnableTwitterShare()
    {
        $post = Post::factory()->create([
            'enable_twitter_share' => $this->faker->boolean(),
        ]);

        $this->assertSame($post->enable_twitter_share, $post->actual_enable_twitter_share);
    }

    /**
     * @group accessor
     */
    public function testAccessor_actualEnableTwitterShare_nullならsettingの値を返す()
    {
        $post = Post::factory()->create([
            'enable_twitter_share' => null,
        ]);

        $this->assertSame($this->setting->get('postDefault.enableTwitterShare'), $post->actual_enable_twitter_share);
    }

    public function dataAccessor_isMine()
    {
        return [
            '未ログイン' => [
                function () {
                    return User::factory()->create();
                },
                false,
            ],
            '別のユーザの投稿' => [
                function () {
                    $user = User::factory()->create();
                    Sanctum::actingAs(User::factory()->create());
                    return $user;
                },
                false,
            ],
            '自分の投稿' => [
                function () {
                    $user = User::factory()->create();
                    Sanctum::actingAs($user);
                    return $user;
                },
                true,
            ],
        ];
    }

    /**
     * @group accessor
     * @dataProvider dataAccessor_isMine
     */
    public function testAccessor_isMine($user, bool $result)
    {
        $post = Post::factory()->create([
            'user_id' => value($user),
        ]);

        $this->assertSame($result, $post->is_mine);
    }

    public function dataAccessor_isPublic()
    {
        return [
            '非公開' => [
                function () {
                    return Post::factory()->private()->create();
                },
                false,
            ],
            '公開開始日時が現在より後' => [
                function () {
                    return Post::factory()->public()->beforePublish()->create();
                },
                false,
            ],
            '公開終了日時が現在より前' => [
                function () {
                    return Post::factory()->public()->afterPublish()->create();
                },
                false,
            ],
            '公開中' => [
                function () {
                    return Post::factory()->public()->create();
                },
                true,
            ],
        ];
    }

    /**
     * @group accessor
     * @dataProvider dataAccessor_isPublic
     */
    public function testAccessor_isPublic($post, bool $result)
    {
        $this->assertSame($result, value($post)->is_public);
    }

    /**
     * @group accessor
     */
    public function testAccessor_imagesDir()
    {
        $post = Post::factory()->create();

        $this->assertSame("public/images/{$post->id}", $post->images_dir);
    }

    /**
     * @group scope
     */
    public function testScope_public()
    {
        $post1 = Post::factory()->private()->create();
        $post2 = Post::factory()->public()->beforePublish()->create();
        $post3 = Post::factory()->public()->afterPublish()->create();
        $post4 = Post::factory()->public()->create();

        $publicPosts = Post::public()->get();
        $this->assertCount(1, $publicPosts);
        $this->assertTrue($publicPosts->contains($post4));
    }

    public function dataScope_search()
    {
        return [
            '単一キーワード検索' => [
                'foo',
                function () {
                    $post1 = Post::factory()->create(['caption' => 'foo']);
                    $post2 = Post::factory()->create(['caption' => 'bar']);
                    $post3 = Post::factory()->create(['caption' => '']);
                    $post3->tags()->save(Tag::factory()->make(['name' => 'foo']));

                    return $post1;
                },
            ],
            '複数キーワード検索' => [
                'foo bar',
                function () {
                    $post1 = Post::factory()->create(['caption' => 'foo']);
                    $post2 = Post::factory()->create(['caption' => 'bar']);
                    $post3 = Post::factory()->create(['caption' => 'foobar']);

                    return $post3;
                },
            ],
            '単一タグ検索' => [
                '#foo',
                function () {
                    $post1 = Post::factory()->create(['caption' => 'foo']);
                    $post2 = Post::factory()->create(['caption' => '']);
                    $post3 = Post::factory()->create(['caption' => '']);
                    $post2->tags()->save(Tag::factory()->make(['name' => 'foo']));
                    $post3->tags()->save(Tag::factory()->make(['name' => 'bar']));

                    return $post2;
                },
            ],
            '複数タグ検索' => [
                '#foo #bar',
                function () {
                    $post1 = Post::factory()->create(['caption' => '']);
                    $post2 = Post::factory()->create(['caption' => '']);
                    $post3 = Post::factory()->create(['caption' => '']);
                    $tag1 = Tag::factory()->make(['name' => 'foo']);
                    $tag2 = Tag::factory()->make(['name' => 'bar']);
                    $post1->tags()->save($tag1);
                    $post2->tags()->save($tag2);
                    $post3->tags()->saveMany([$tag1, $tag2]);

                    return $post3;
                },
            ],
            'キーワードとタグの混合' => [
                'foo #bar',
                function () {
                    $post1 = Post::factory()->create(['caption' => 'foo']);
                    $post2 = Post::factory()->create(['caption' => 'bar']);
                    $post3 = Post::factory()->create(['caption' => 'foobar']);
                    $post4 = Post::factory()->create(['caption' => '']);
                    $tag1 = Tag::factory()->make(['name' => 'bar']);
                    $tag2 = Tag::factory()->make(['name' => 'foo']);
                    $post1->tags()->save($tag1);
                    $post2->tags()->save($tag2);
                    $post4->tags()->saveMany([$tag1, $tag2]);

                    return $post1;
                },
            ],
            '%で検索' => [
                '100%',
                function () {
                    $post1 = Post::factory()->create(['caption' => '100%']);
                    $post2 = Post::factory()->create(['caption' => '100meter']);

                    return $post1;
                },
            ],
        ];
    }

    /**
     * @group scope
     * @dataProvider dataScope_search
     */
    public function testScope_search(string $keyword, Closure $generator)
    {
        $expected = value($generator);
        $posts = Post::search($keyword)->get();

        $this->assertCount(1, $posts);
        $this->assertTrue($posts->contains($expected));
    }

    public function test_syncTagsFromCaption()
    {
        $spy = $this->spy(Tag::class);

        $post = Post::factory()->create([
            'caption' => '#foo',
        ]);
        $oldTag = Tag::factory()->create([
            'name' => 'bar',
        ]);
        $post->tags()->save($oldTag);

        $post->syncTagsFromCaption();

        $tags = $post->tags()->get();
        $this->assertCount(1, $tags);
        $this->assertSame('foo', $tags->first()->name);
        $spy->shouldHaveReceived('clean')->once();
    }

    public function test_makeImagesDir()
    {
        Storage::fake();
        $post = Post::factory()->create();

        $post->makeImagesDir();

        $this->assertDirectoryExists(Storage::path($post->images_dir));
    }

    public function test_deleteImagesDir()
    {
        Storage::fake();
        $post = Post::factory()->create();
        $post->makeImagesDir();

        $post->deleteImagesDir();

        $this->assertDirectoryDoesNotExist(Storage::path($post->images_dir));
    }
}
