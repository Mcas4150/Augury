export default function SwarmscapePage() {
  return (
    <main className="flex flex-col items-center justify-start">
      <h1 className="text-4xl font-bold my-8 font-roman">
        Swarmscape
      </h1>

      {/* Grid container for the two videos */}
      <div className="w-full max-w-7xl grid grid-cols-1 md:grid-cols-2 gap-8 px-4">

        {/* --- Video 1 --- */}
        <div>
          <div className="relative aspect-video">
            <iframe
              className="absolute top-0 left-0 w-full h-full"
              src="https://www.youtube.com/embed/s6aQn8vQ87Q?si=j3szj_oQGM6xqfbp"
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            ></iframe>
          </div>
        </div>

        {/* --- Video 2 --- */}
        <div>
          <div className="relative aspect-video">
            <iframe
              className="absolute top-0 left-0 w-full h-full"
              src="https://www.youtube.com/embed/nMV3XKE9Pf4?si=43dWYqOzWnFRnYmO"
              title="YouTube video player 2"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            ></iframe>
          </div>
        </div>

      </div>
    </main>
  );
}