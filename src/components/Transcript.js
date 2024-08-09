import React, { useState, useEffect } from "react";
import axios from "axios";
import { useMsal } from "@azure/msal-react";
import TranscriptItem from "./TranscriptItem";
import Loader from "./Loader"; // Assume you have a Loader component
import "./Transcript.css"; // Your custom styles for the transcript

const Transcript = () => {
  const { instance, accounts } = useMsal();
  const [error, setError] = useState(null);
  const [events, setEvents] = useState([]);
  const [accessToken, setAccessToken] = useState(null);
  const [empid, setEmpid] = useState();
  const [transcript, setTranscript] = useState([]);
  const [loading, setLoading] = useState(false); // Loading state

  useEffect(() => {
    const fetchTranscripts = async () => {
      setLoading(true); // Start loading
      try {
        const accessTokenRequest = {
          scopes: ["https://graph.microsoft.com/.default"],
          account: accounts[0],
        };

        const accessTokenResponse = await instance.acquireTokenSilent(
          accessTokenRequest
        );
        const accessToken = accessTokenResponse.accessToken;
        console.log("Access Token:", accessToken);
        setAccessToken(accessToken);

        const userdata = await axios.get(
          "https://graph.microsoft.com/v1.0/me",
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        console.log("User ID:", userdata.data.id);
        setEmpid(userdata.data.id);

        const getuserevents = await axios.get(
          `https://graph.microsoft.com/v1.0/users/${userdata.data.id}/events`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        console.log("User Events:", getuserevents.data.value);
        setEvents(getuserevents.data.value);
        setError(null); // Reset error state on success
         
      } catch (err) {
        console.error("Error fetching user events:", err);
        setError(err);
      } finally {
        setLoading(false); // End loading
      }
    };

    fetchTranscripts();
  }, [instance, accounts]);

  const fetchTranscripts2 = async (joinUrl) => {
    setLoading(true); // Start loading
    try {
      const getmeetingid = await axios.get(
        `https://graph.microsoft.com/beta/users/${empid}/onlineMeetings?$filter=JoinWebUrl eq '${joinUrl}'`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      console.log("Meeting ID:", getmeetingid.data.value[0].id);

      const gettranscriptid = await axios.get(
        `https://graph.microsoft.com/beta/users/${empid}/onlineMeetings/${getmeetingid.data.value[0].id}/transcripts`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      console.log("Transcript ID:", gettranscriptid.data.value[0].id);

      const gettranscript = await axios.get(
        `https://graph.microsoft.com/beta/users/${empid}/onlineMeetings/${getmeetingid.data.value[0].id}/transcripts/${gettranscriptid.data.value[0].id}/metadataContent`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      console.log("Transcript Data:", gettranscript.data);
    
      // Ensure the transcript data is an array of JSON objects
      const parsedTranscript = gettranscript.data
        .split("\n")
        .map((line) => {
          try {
            return JSON.parse(line);
          } catch (e) {
            return null;
          }
        })
        .filter((item) => item !== null);

      setTranscript(parsedTranscript);
      setError(null); // Reset error state on success

      // Convert transcript to text file and upload
      const textFile = createTranscriptTextFile(parsedTranscript);
      uploadTranscript(textFile, getmeetingid.data.value[0].id);

    } catch (err) {
      console.error("Error fetching transcript:", err);
      setTranscript([]); // Clear transcript state on error
      setError(err);
    } finally {
      setLoading(false); // End loading
    }
  };

  const createTranscriptTextFile = (transcript) => {
    const textContent = transcript.map(entry => 
      `${entry.speakerName}: ${entry.spokenText}`
    ).join("\n");

    return new Blob([textContent], { type: 'text/plain' });
  };

  const uploadTranscript = async (file, meetingId) => {
    const formData = new FormData();
    formData.append('userId', empid);
    formData.append('patientId', meetingId);
    formData.append('files', file, 'transcript.txt');

    try {
      const response = await axios.post(
        'http://localhost:5000/upload',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      console.log('Upload response:', response.data);
    } catch (err) {
      console.error('Error uploading transcript:', err);
    }
  };

  const handleEventClick = (joinUrl) => {
    fetchTranscripts2(joinUrl);
  };

  return (
    <div className="main">
      <h1>Get Your Meeting Transcript</h1>
      {loading && <Loader />} {/* Show loader when loading */}
      <h1>Events</h1>
      <ul>
        {events.map((event) => (
          <li
            key={event.id}
            onClick={() => handleEventClick(event.onlineMeeting?.joinUrl)}
          >
            {event.subject}
          </li>
        ))}
      </ul>
      {error ? (
        <div>Error: {error.message}</div>
      ) : (
        <div>
          <h1>Transcript</h1>
          <div className="transcripts">
            {Array.isArray(transcript) && transcript.length > 0 ? (
              transcript.map((transcriptEntry, index) => (
                <TranscriptItem
                  key={index}
                  speakerName={transcriptEntry.speakerName}
                  spokenText={transcriptEntry.spokenText}
                />
              ))
            ) : (
              <p>No transcript available.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Transcript;

// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import { useMsal } from "@azure/msal-react";
// import TranscriptItem from "./TranscriptItem";
// import Loader from "./Loader"; // Assume you have a Loader component
// import "./Transcript.css"; // Your custom styles for the transcript

// const Transcript = () => {
//   const { instance, accounts } = useMsal();
//   const [error, setError] = useState(null);
//   const [events, setEvents] = useState([]);
//   const [accessToken, setAccessToken] = useState(null);
//   const [empid, setEmpid] = useState();
//   const [transcript, setTranscript] = useState([]);
//   const [loading, setLoading] = useState(false); // Loading state

//   useEffect(() => {
//     const fetchTranscripts = async () => {
//       setLoading(true); // Start loading
//       try {
//         const accessTokenRequest = {
//           scopes: ["https://graph.microsoft.com/.default"],
//           account: accounts[0],
//         };

//         const accessTokenResponse = await instance.acquireTokenSilent(
//           accessTokenRequest
//         );
//         const accessToken = accessTokenResponse.accessToken;
//         console.log("Access Token:", accessToken);
//         setAccessToken(accessToken);

//         const userdata = await axios.get(
//           "https://graph.microsoft.com/v1.0/me",
//           {
//             headers: {
//               Authorization: `Bearer ${accessToken}`,
//             },
//           }
//         );
//         console.log("User ID:", userdata.data.id);
//         setEmpid(userdata.data.id);

//         const getuserevents = await axios.get(
//           `https://graph.microsoft.com/v1.0/users/${userdata.data.id}/events`,
//           {
//             headers: {
//               Authorization: `Bearer ${accessToken}`,
//             },
//           }
//         );

//         console.log("User Events:", getuserevents.data.value);
//         setEvents(getuserevents.data.value);
//         setError(null); // Reset error state on success
         
//       } catch (err) {
//         console.error("Error fetching user events:", err);
//         setError(err);
//       } finally {
//         setLoading(false); // End loading
//       }
//     };


//     fetchTranscripts();
//   }, [instance, accounts]);

//   const fetchTranscripts2 = async (joinUrl) => {
//     setLoading(true); // Start loading
//     try {
//       const getmeetingid = await axios.get(
//         `https://graph.microsoft.com/beta/users/${empid}/onlineMeetings?$filter=JoinWebUrl eq '${joinUrl}'`,
//         {
//           headers: {
//             Authorization: `Bearer ${accessToken}`,
//           },
//         }
//       );
//       console.log("Meeting ID:", getmeetingid.data.value[0].id);

//       const gettranscriptid = await axios.get(
//         `https://graph.microsoft.com/beta/users/${empid}/onlineMeetings/${getmeetingid.data.value[0].id}/transcripts`,
//         {
//           headers: {
//             Authorization: `Bearer ${accessToken}`,
//           },
//         }
//       );
//       console.log("Transcript ID:", gettranscriptid.data.value[0].id);

//       const gettranscript = await axios.get(
//         `https://graph.microsoft.com/beta/users/${empid}/onlineMeetings/${getmeetingid.data.value[0].id}/transcripts/${gettranscriptid.data.value[0].id}/metadataContent`,
//         {
//           headers: {
//             Authorization: `Bearer ${accessToken}`,
//           },
//         }
//       );
//       console.log("Transcript Data:", gettranscript.data);
//       console.log("Transcript Data:", gettranscript.data);
    
//       // Ensure the transcript data is an array of JSON objects
//       const parsedTranscript = gettranscript.data
//         .split("\n")
//         .map((line) => {
//           try {
//             return JSON.parse(line);
//           } catch (e) {
//             return null;
//           }
//         })
//         .filter((item) => item !== null);

//       setTranscript(parsedTranscript);
//       setError(null); // Reset error state on success
//     } catch (err) {
//       console.error("Error fetching transcript:", err);
//       setTranscript([]); // Clear transcript state on error
//       setError(err);
//     } finally {
//       setLoading(false); // End loading
//     }
//   };

//   const handleEventClick = (joinUrl) => {
//     fetchTranscripts2(joinUrl);
//   };

//   return (
//     <div className="main">
//       <h1>Get Your Meeting Transcript</h1>
//       {loading && <Loader />} {/* Show loader when loading */}
//       <h1>Events</h1>
//       <ul>
//         {events.map((event) => (
//           <li
//             key={event.id}
//             onClick={() => handleEventClick(event.onlineMeeting?.joinUrl)}
//           >
//             {event.subject}
//           </li>
//         ))}
//       </ul>
//       {error ? (
//         <div>Error: {error.message}</div>
//       ) : (
//         <div>
//           <h1>Transcript</h1>
//           <div className="transcripts">
//             {Array.isArray(transcript) && transcript.length > 0 ? (
//               transcript.map((transcriptEntry, index) => (
//                 <TranscriptItem
//                   key={index}
//                   speakerName={transcriptEntry.speakerName}
//                   spokenText={transcriptEntry.spokenText}
//                 />
//               ))
//             ) : (
//               <p>No transcript available.</p>
//             )}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Transcript;
