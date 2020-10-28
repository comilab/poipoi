<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class Setting extends JsonResource
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
            'siteTitle' => $this['siteTitle'],
            'siteDescription' => $this['siteDescription'],
            'perPage' => $this['perPage'],
            'denyRobot' => $this['denyRobot'],
            'enableFeed' => $this['enableFeed'],
            'postDefault' => [
                'denyRobotScope' => $this['postDefault']['denyRobotScope'],
                'enableReaction' => $this['postDefault']['enableReaction'],
                'enableTwitterShare' => $this['postDefault']['enableTwitterShare'],
                'allowedEmojis' => $this['postDefault']['allowedEmojis'],
                'deniedEmojis' => $this['postDefault']['deniedEmojis'],
            ],
        ];
    }
}
