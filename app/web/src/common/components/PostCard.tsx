import Avatar from './Avatar';

interface PostCardProps {
  name: string;
  handle: string;
  avatar: string;
  body?: string;
  imageUrl?: string;
  topic?: string;
}

export default function PostCard({ name, handle, avatar, body, imageUrl, topic }: PostCardProps) {
  return (
    <div className="post-card">
      <div className="post-head">
        <Avatar initial={avatar} size="md" />
        <div className="post-meta">
          <div className="post-name">{name}</div>
          <div className="post-handle">{handle}</div>
        </div>
      </div>

      {imageUrl && <img className="post-image" src={imageUrl} alt="post media" />}
      {body && <div className="post-body">{body}</div>}
      {topic && <div className="post-topic">{topic}</div>}
    </div>
  );
}
