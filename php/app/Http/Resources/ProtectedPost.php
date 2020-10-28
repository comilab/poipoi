<?php

namespace App\Http\Resources;

class ProtectedPost extends Post
{
    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array
     */
    public function toArray($request)
    {
        $array = parent::toArray($request);

        unset($array['text']);
        unset($array['reactions']);

        $array['images'] = Image::collection($this->whenLoaded('images', function () {
            if (!$this->show_thumbnail) {
                return [];
            }

            return $this->images->take(1);
        }));

        return $array;
    }
}
