<?php

namespace App\Models;

use App\Services\Emoji;
use App\Services\Setting as SettingService;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Storage;

class Post extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'caption',
        'show_images_list',
        'text',
        'scope',
        'password',
        'publish_start',
        'publish_end',
        'rating',
        'pinned',
        'show_thumbnail',
        'deny_robot',
        'enable_reaction',
        'allowed_emojis',
        'denied_emojis',
        'enable_twitter_share',
    ];

    protected $casts = [
        'user_id' => 'integer',
        'show_images_list' => 'boolean',
        'publish_start' => 'datetime',
        'publish_end' => 'datetime',
        'pinned' => 'boolean',
        'show_thumbnail' => 'boolean',
        'deny_robot' => 'boolean',
        'enable_reaction' => 'boolean',
        'allowed_emojis' => 'collection',
        'denied_emojis' => 'collection',
        'enable_twitter_share' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function images()
    {
        return $this->hasMany(Image::class)->orderBy('weight');
    }

    public function reactions()
    {
        return $this->hasMany(Reaction::class)->latest();
    }

    public function tags()
    {
        return $this->belongsToMany(Tag::class);
    }

    public function getUrlAttribute(): string
    {
        return url("/posts/{$this->id}");
    }

    public function getTextCountAttribute(): int
    {
        return mb_strlen($this->text);
    }

    public function getActualDenyRobotAttribute(): bool
    {
        if ($this->deny_robot !== null) {
            return $this->deny_robot;
        }

        $denyRobotScope = app(SettingService::class)->get('postDefault.denyRobotScope');

        return in_array($this->scope, $denyRobotScope, true) || in_array($this->rating, $denyRobotScope, true);
    }

    public function getActualEnableReactionAttribute(): bool
    {
        if ($this->enable_reaction !== null) {
            return $this->enable_reaction;
        }

        return app(SettingService::class)->get('postDefault.enableReaction');
    }

    public function getActualAllowedEmojisAttribute(): Collection
    {
        if ($this->allowed_emojis !== null) {
            return $this->allowed_emojis;
        }

        return collect(app(SettingService::class)->get('postDefault.allowedEmojis'));
    }

    public function getActualDeniedEmojisAttribute(): Collection
    {
        if ($this->denied_emojis !== null) {
            return $this->denied_emojis;
        }

        return collect(app(SettingService::class)->get('postDefault.deniedEmojis'));
    }

    public function getEmojisAttribute(): Collection
    {
        if ($this->actual_allowed_emojis->isNotEmpty() && $this->actual_denied_emojis->isNotEmpty()) {
            return $this->actual_allowed_emojis->reject(function ($emoji) {
                return $this->actual_denied_emojis->contains($emoji);
            });
        } else if ($this->actual_allowed_emojis->isNotEmpty()) {
            return $this->actual_allowed_emojis;
        } else if ($this->actual_denied_emojis->isNotEmpty()) {
            return app(Emoji::class)->all()->reject(function ($emoji) {
                return $this->actual_denied_emojis->contains($emoji);
            });
        } else {
            return collect([]);
        }
    }

    public function getActualEnableTwitterShareAttribute(): bool
    {
        if ($this->enable_twitter_share !== null) {
            return $this->enable_twitter_share;
        }

        return app(SettingService::class)->get('postDefault.enableTwitterShare');
    }

    public function getIsMineAttribute(): bool
    {
        return auth()->check() && (auth()->user()->id === $this->user_id);
    }

    public function getIsPublicAttribute(): bool
    {
        if ($this->scope === 'private') {
            return false;
        }

        if ($this->publish_start && Carbon::now()->isBefore($this->publish_start)) {
            return false;
        }
        if ($this->publish_end && Carbon::now()->isAfter($this->publish_end)) {
            return false;
        }

        return true;
    }

    public function getImagesDirAttribute(): string
    {
        return "public/images/{$this->id}";
    }

    public function scopePublic($query)
    {
        return $query
            ->where('scope', '!=', 'private')
            ->where(function ($query) {
                $query
                    ->orWhere('publish_start', null)
                    ->orWhere('publish_start', '<=', Carbon::now());
            })
            ->where(function ($query) {
                $query
                    ->orWhere('publish_end', null)
                    ->orWhere('publish_end', '>=', Carbon::now());
            });
    }

    public function scopeSearch(Builder $query, $keyword)
    {
        $keywords = preg_split('/[\s]/', $keyword);
        $query->where(function ($query) use ($keywords) {
            foreach ($keywords as $keyword) {
                if ($keyword[0] === '#') {
                    $tag = substr($keyword, 1);
                    $query->whereHas('tags', function (Builder $query) use ($tag) {
                        $query->where('name', $tag);
                    });
                } else {
                    $escaped = str_replace(['\\', '%', '_'], ['\\\\', '\%', '\_'], $keyword);
                    $query->whereRaw("caption like ? escape '\'", ["%{$escaped}%"]);
                }
            }
        });
    }

    public function syncTagsFromCaption()
    {
        preg_match_all('/#(\S+)/', $this->caption, $matches);

        $tags = collect($matches[1])
            ->map(function ($tagName) {
                return Tag::firstOrCreate(['name' => $tagName]);
            });

        $this->tags()->sync($tags->pluck('id'));

        resolve(Tag::class)->clean();

        return $this;
    }

    public function makeImagesDir()
    {
        Storage::makeDirectory($this->images_dir);
    }

    public function deleteImagesDir()
    {
        Storage::deleteDirectory($this->images_dir);
    }
}
