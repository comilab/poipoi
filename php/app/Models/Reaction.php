<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Reaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'emoji',
    ];

    protected $casts = [
        'post_id' => 'integer',
    ];

    public function post()
    {
        return $this->belongsTo(Post::class);
    }
}
