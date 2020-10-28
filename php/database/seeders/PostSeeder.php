<?php

namespace Database\Seeders;

use App\Models\Image;
use App\Models\Post;
use App\Models\Reaction;
use Illuminate\Database\Seeder;

class PostSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        Post::factory()
            ->count(48)
            ->has(Image::factory()->count(random_int(0, 5)))
            ->has(Reaction::factory()->count(random_int(0, 50)))
            ->create([
                'user_id' => 1,
            ]);
    }
}
