import { ambientSounds } from '../data/ambientSounds'
import { useAudioStore } from '../store/audioStore'

export function AmbientSoundPicker() {
  const { soundId, volume, setSound, setVolume } = useAudioStore()

  return (
    <div className="flex flex-col gap-3">
      {/* Sound buttons */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none justify-center">
        {ambientSounds.map((sound) => {
          const isActive = soundId === sound.id
          return (
            <button
              key={sound.id}
              onClick={() => setSound(sound.id)}
              aria-pressed={isActive}
              className={[
                'flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E8A87C]',
                isActive
                  ? 'bg-[#E8A87C]/25 text-[#E8A87C] border border-[#E8A87C]/50'
                  : 'text-[#8C6E5B]/60 hover:text-[#8C6E5B] border border-transparent',
              ].join(' ')}
            >
              <span>{sound.emoji}</span>
              <span>{sound.label}</span>
            </button>
          )
        })}
      </div>

      {/* Volume slider — only shown when a sound is selected */}
      {soundId !== 'silence' && (
        <div className="flex items-center gap-3 px-1">
          <span className="text-xs text-[#8C6E5B]/60 w-14 shrink-0">Volume</span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            aria-label="Ambient sound volume"
            className="flex-1 h-1.5 appearance-none rounded-full cursor-pointer
              [&::-webkit-slider-thumb]:appearance-none
              [&::-webkit-slider-thumb]:w-4
              [&::-webkit-slider-thumb]:h-4
              [&::-webkit-slider-thumb]:rounded-full
              [&::-webkit-slider-thumb]:bg-[#E8A87C]
              [&::-webkit-slider-track]:rounded-full"
            style={{
              background: `linear-gradient(to right, #E8A87C ${volume * 100}%, rgba(232,168,124,0.2) ${volume * 100}%)`,
            }}
          />
        </div>
      )}
    </div>
  )
}
