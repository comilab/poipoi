<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreatePostsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('posts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade')->index();
            $table->text('title');
            $table->text('caption');
            $table->boolean('show_images_list');
            $table->text('text');
            $table->string('scope')->index();
            $table->string('password');
            $table->dateTime('publish_start')->nullable()->index();
            $table->dateTime('publish_end')->nullable()->index();
            $table->string('rating')->nullable();
            $table->boolean('pinned')->index();
            $table->boolean('show_thumbnail');
            $table->boolean('deny_robot')->nullable();
            $table->boolean('enable_reaction')->nullable();
            $table->text('allowed_emojis')->nullable();
            $table->text('denied_emojis')->nullable();
            $table->boolean('enable_twitter_share')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('posts');
    }
}
