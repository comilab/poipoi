<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class Reaction extends JsonResource
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
            'postId' => $this->post_id,
            'emoji' => $this->emoji,
            'createdAt' => $this->created_at,
            'updatedAt' => $this->updated_at,
        ];
    }
}
