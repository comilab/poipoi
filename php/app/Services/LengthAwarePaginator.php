<?php

namespace App\Services;

use \Illuminate\Pagination\LengthAwarePaginator as BaseLengthAwarePaginator;

class LengthAwarePaginator extends BaseLengthAwarePaginator
{
    public function toArray()
    {
        return [
            'currentPage' => $this->currentPage(),
            'data' => $this->items->toArray(),
            'firstPageUrl' => $this->url(1),
            'from' => $this->firstItem(),
            'lastPage' => $this->lastPage(),
            'lastPageUrl' => $this->url($this->lastPage()),
            'nextPageUrl' => $this->nextPageUrl(),
            'path' => $this->path(),
            'perPage' => $this->perPage(),
            'prevPageUrl' => $this->previousPageUrl(),
            'to' => $this->lastItem(),
            'total' => $this->total(),
        ];
    }
}
