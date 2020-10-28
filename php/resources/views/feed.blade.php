<?php echo '<?xml version="1.0" encoding="utf-8"?>' ?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/">
    <channel>
        <title>{{ $setting->get('siteTitle') }}</title>
        <link>{{ url('/') }}</link>
        <description>{{ $setting->get('siteDescription') }}</description>
        <lastBuildDate>{{ $posts->isNotEmpty() ? $posts->first()->created_at->toRfc7231String() : date(DATE_RSS) }}</lastBuildDate>
        <docs>https://validator.w3.org/feed/docs/rss2.html</docs>
        <generator>poipoi</generator>
        @foreach ($posts as $post)
            <item>
                <title>{{ $post->title !== '' ? $post->title : $post->caption }}</title>
                <link>{{ $post->url }}</link>
                <guid>{{ $post->url }}</guid>
                <pubDate>{{ $post->created_at->toRfc7231String() }}</pubDate>
                <description><![CDATA[
                    @if ($post->images->isNotEmpty() && $post->show_thumbnail)
                        <div><img src="{{ url($post->images->first()->public_paths['small']) }}" /></div>
                    @endif
                    <p>{!! nl2br($post->caption) !!}</p>
                ]]></description>
            </item>
        @endforeach
    </channel>
</rss>
