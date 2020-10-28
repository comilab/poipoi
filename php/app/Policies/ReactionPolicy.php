<?php

namespace App\Policies;

use App\Models\Reaction;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;
use Illuminate\Http\Request;

class ReactionPolicy
{
    use HandlesAuthorization;

    /**
     * @var \App\Models\Post
     */
    protected $post;

    public function __construct(Request $request)
    {
        $this->post = $request->route('post');
    }

    /**
     * Determine whether the user can view any models.
     *
     * @param  \App\Models\User  $user
     * @return mixed
     */
    public function viewAny(?User $user)
    {
        return $this->post->is_mine || ($this->post->is_public && $this->post->actual_enable_reaction);
    }

    /**
     * Determine whether the user can view the model.
     *
     * @param  \App\Models\User  $user
     * @param  \App\Models\Reaction  $reaction
     * @return mixed
     */
    public function view(User $user, Reaction $reaction)
    {
        //
    }

    /**
     * Determine whether the user can create models.
     *
     * @param  \App\Models\User  $user
     * @return mixed
     */
    public function create(?User $user)
    {
        return $this->post->is_mine || ($this->post->is_public && $this->post->actual_enable_reaction);
    }

    /**
     * Determine whether the user can update the model.
     *
     * @param  \App\Models\User  $user
     * @param  \App\Models\Reaction  $reaction
     * @return mixed
     */
    public function update(User $user, Reaction $reaction)
    {
        //
    }

    /**
     * Determine whether the user can delete the model.
     *
     * @param  \App\Models\User  $user
     * @param  \App\Models\Reaction  $reaction
     * @return mixed
     */
    public function delete(User $user, Reaction $reaction)
    {
        return $this->post->is_mine;
    }

    /**
     * Determine whether the user can restore the model.
     *
     * @param  \App\Models\User  $user
     * @param  \App\Models\Reaction  $reaction
     * @return mixed
     */
    public function restore(User $user, Reaction $reaction)
    {
        //
    }

    /**
     * Determine whether the user can permanently delete the model.
     *
     * @param  \App\Models\User  $user
     * @param  \App\Models\Reaction  $reaction
     * @return mixed
     */
    public function forceDelete(User $user, Reaction $reaction)
    {
        //
    }
}
