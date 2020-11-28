<?php

namespace Database\Factories;

use App\Models\Post;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Carbon;

class PostFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Post::class;

    /**
     * Define the model's default state.
     *
     * @return array
     */
    public function definition()
    {
        $publishEnd = $this->faker->dateTime(Carbon::now()->addYear());
        $publishStart = $this->faker->dateTime($publishEnd);

        return [
            'user_id' => User::factory(),
            'title' => $this->faker->realText(32),
            'caption' => $this->faker->realText(),
            'show_images_list' => $this->faker->boolean(),
            'text' => $this->faker->realText(),
            'scope' => $this->faker->randomElement(['public', 'password', 'private']),
            'password' => $this->faker->password,
            'publish_start' => $this->faker->optional()->passthrough($publishStart),
            'publish_end' => $this->faker->optional()->passthrough($publishEnd),
            'rating' => $this->faker->randomElement([null, 'nsfw', 'r18']),
            'pinned' => $this->faker->boolean(),
            'show_thumbnail' => $this->faker->boolean(),
            'deny_robot' => $this->faker->randomElement([null, true, false]),
            'enable_reaction' => $this->faker->randomElement([null, true, false]),
            'allowed_emojis' => $this->faker->optional()->passthrough([$this->faker->emoji]),
            'denied_emojis' => $this->faker->optional()->passthrough([$this->faker->emoji]),
            'enable_twitter_share' => $this->faker->randomElement([null, true, false]),
        ];
    }

    public function public()
    {
        return $this->state(function () {
            $publishEnd = $this->faker->dateTimeBetween(Carbon::now(), Carbon::now()->addYear());
            $publishStart = $this->faker->dateTime();

            return [
                'scope' => $this->faker->randomElement(['public', 'password']),
                'publish_start' => $this->faker->optional()->passthrough($publishStart),
                'publish_end' => $this->faker->optional()->passthrough($publishEnd),
            ];
        });
    }

    public function private()
    {
        return $this->state(function () {
            $future = $this->faker->dateTimeBetween(Carbon::now()->addSecond(), Carbon::now()->addYear());
            $past = $this->faker->dateTime(Carbon::now()->subSecond());

            return $this->faker->randomElement([
                [
                    'scope' => 'private',
                ],
                [
                    'scope' => $this->faker->randomElement(['public', 'password']),
                    'publish_start' => $future,
                    'publish_end' => $this->faker->optional()->dateTime($future),
                ],
                [
                    'scope' => $this->faker->randomElement(['public', 'password']),
                    'publish_start' => $this->faker->optional()->dateTimeBetween(Carbon::make($past)->subYear(), $past),
                    'publish_end' => $past,
                ]
            ]);
        });
    }

    public function beforePublish()
    {
        return $this->state(function () {
            $future = $this->faker->dateTimeBetween(Carbon::now()->addSecond(), Carbon::now()->addYear());

            return [
                'publish_start' => $future,
                'publish_end' => $this->faker->optional()->dateTime($future),
            ];
        });
    }

    public function afterPublish()
    {
        return $this->state(function () {
            $past = $this->faker->dateTime(Carbon::now()->subSecond());

            return [
                'publish_start' => $this->faker->optional()->dateTimeBetween(Carbon::make($past)->subYear(), $past),
                'publish_end' => $past,
            ];
        });
    }

    public function outsideOfPeriod()
    {
        $future = $this->faker->dateTimeBetween(Carbon::now()->addSecond(), Carbon::now()->addYear());
        $past = $this->faker->dateTime(Carbon::now()->subSecond());

        return $this->state(function () {
            $future = $this->faker->dateTimeBetween(Carbon::now()->addSecond(), Carbon::now()->addYear());
            $past = $this->faker->dateTime(Carbon::now()->subSecond());

            return $this->faker->randomElement([
                [
                    'scope' => $this->faker->randomElement(['public', 'password']),
                    'publish_start' => $future,
                    'publish_end' => $this->faker->optional()->dateTime($future),
                ],
                [
                    'scope' => $this->faker->randomElement(['public', 'password']),
                    'publish_start' => $this->faker->optional()->dateTimeBetween(Carbon::make($past)->subYear(), $past),
                    'publish_end' => $past,
                ]
            ]);
        });
    }
}
