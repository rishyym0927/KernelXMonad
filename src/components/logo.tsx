import React from 'react'
import Image from 'next/image'

const LogoIcon = () => {
  return (
    <div>
        <Image
          src="/logo.png"
          alt="Logo"
          width={40}
          height={40}
          className="rounded-full"
        />
    </div>
  )
}

export default LogoIcon
