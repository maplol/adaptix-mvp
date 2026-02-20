interface Props {
  src?: string;
  name: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-14 h-14 text-lg' };

export default function Avatar({ src, name, size = 'md' }: Props) {
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2);

  if (src) {
    return <img src={src} alt={name} className={`${sizeMap[size]} rounded-full object-cover bg-white/10`} />;
  }

  return (
    <div className={`${sizeMap[size]} rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center font-bold text-white`}>
      {initials}
    </div>
  );
}
