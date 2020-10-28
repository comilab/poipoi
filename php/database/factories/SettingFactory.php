<?php

namespace Database\Factories;

use App\Models\Setting;
use Illuminate\Database\Eloquent\Factories\Factory;

class SettingFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Setting::class;

    /**
     * Define the model's default state.
     *
     * @return array
     */
    public function definition()
    {
        return [
            'data' => [
                'siteTitle' => $this->faker->word(),
                'siteDescription' => $this->faker->text(),
                'perPage' => $this->faker->randomDigitNotNull,
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
        ];
    }
}
