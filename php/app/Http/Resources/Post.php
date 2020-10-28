<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class Post extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array
     */
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'userId' => $this->user_id,
            'title' => $this->title,
            'caption' => $this->caption,
            'showImagesList' => $this->show_images_list,
            'text' => $this->text,
            'scope' => $this->scope,
            'password' => $this->when(auth()->check(), $this->password),
            'publishStart' => $this->publish_start,
            'publishEnd' => $this->publish_end,
            'rating' => $this->rating,
            'pinned' => $this->pinned,
            'showThumbnail' => $this->show_thumbnail,
            'denyRobot' => $this->deny_robot,
            'enableReaction' => $this->enable_reaction,
            'allowedEmojis' => $this->allowed_emojis,
            'deniedEmojis' => $this->denied_emojis,
            'enableTwitterShare' => $this->enable_twitter_share,
            'createdAt' => $this->created_at,
            'updatedAt' => $this->updated_at,

            'url' => $this->url,
            'textCount' => $this->text_count,
            'actualDenyRobot' => $this->actual_deny_robot,
            'actualEnableReaction' => $this->actual_enable_reaction,
            'actualAllowedEmojis' => $this->actual_allowed_emojis,
            'actualDeniedEmojis' => $this->actual_denied_emojis,
            'actualEnableTwitterShare' => $this->actual_enable_twitter_share,
            'emojis' => $this->emojis,

            'images' => Image::collection($this->whenLoaded('images')),
            'imagesCount' => (int) $this->images_count,

            'reactions' => Reaction::collection($this->when(
                $this->is_mine || $this->actual_enable_reaction,
                $this->whenLoaded('reactions')
            )),
            'reactionsCount' => $this->when(
                $this->is_mine || $this->actual_enable_reaction,
                (int) $this->reactions_count,
            ),
        ];
    }
}
