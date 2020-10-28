<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class Image extends Model
{
    use HasFactory;

    protected $casts = [
        'post_id' => 'integer',
        'weight' => 'integer',
    ];

    protected $touches = ['post'];

    public function post()
    {
        return $this->belongsTo(Post::class);
    }

    public function getPathsAttribute(): array
    {
        return [
            'original' => "public/images/{$this->post_id}/original_{$this->filename}.{$this->extension}",
            'large' => "public/images/{$this->post_id}/large_{$this->filename}.jpeg",
            'medium' => "public/images/{$this->post_id}/medium_{$this->filename}.jpeg",
            'small' => "public/images/{$this->post_id}/small_{$this->filename}.jpeg",
        ];
    }

    public function getPublicPathsAttribute(): array
    {
        return [
            'original' => Storage::url($this->paths['original']),
            'large' => Storage::url($this->paths['large']),
            'medium' => Storage::url($this->paths['medium']),
            'small' => Storage::url($this->paths['small']),
        ];
    }

    public function saveImage(string $tempFile)
    {
        Storage::move("{$tempFile}", $this->paths['original']);
        Storage::move("{$tempFile}.large", $this->paths['large']);
        Storage::move("{$tempFile}.medium", $this->paths['medium']);
        Storage::move("{$tempFile}.small", $this->paths['small']);
    }

    public function deleteImage()
    {
        Storage::delete($this->paths['original']);
        Storage::delete($this->paths['large']);
        Storage::delete($this->paths['medium']);
        Storage::delete($this->paths['small']);
    }
}
