<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class Image extends JsonResource
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
            'postId' => $this->post_id,
            'filename' => $this->filename,
            'extension' => $this->extension,
            'weight' => $this->weight,
            'publicPaths' => $this->public_paths,
            'createdAt' => $this->created_at,
            'updatedAt' => $this->updated_at,
        ];
    }
}
