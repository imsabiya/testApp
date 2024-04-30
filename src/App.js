import React, { useState, useEffect } from "react";
import { init } from "onfido-sdk-ui";
import axios from "axios";

import "./App.css";

function App() {
  const [onfidoInstance, setOnfidoInstance] = useState(null);
  const envToken = process.env.REACT_APP_TOKEN;
  

  const fetchToken = async () => {
    try {
      const response = await axios.post(
        "https://209b1321-f209-4323-bfe2-185d7d1141a9-00-3ujg2stfczqbx.riker.replit.dev/api/applicants/",
        {
          first_name: "edward",
          last_name: "thomas",
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization:
              `Token token=${envToken}`,
          },
        }
      );
      const applicantId = response.data.id;

      if (applicantId) {
        const workflowResponse = await axios.post(
          "https://209b1321-f209-4323-bfe2-185d7d1141a9-00-3ujg2stfczqbx.riker.replit.dev/api/workflow_runs",
          {
            workflow_id: "f3b63ba8-bd06-41ca-a325-94af53e92286",
            applicant_id: applicantId,
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization:
              `Token token=${envToken}`,
            },
          }
        );

        //console.log(workflowResponse,"wrfkl");
        const workflowRunId = workflowResponse.data.id;

        const tokenResponse = await axios.post(
          "https://209b1321-f209-4323-bfe2-185d7d1141a9-00-3ujg2stfczqbx.riker.replit.dev/api/sdk_token",
          {
            applicant_id: applicantId,
            //referrer: "http://localhost:3000/*",
            //cross_device_url: "https://example.com",
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization:
              `Token token=${envToken}`,
            },
          }
        );
        return tokenResponse.data.token;
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const submitCheck = async () => {
    try{
      const response = await axios.post(
        "https://209b1321-f209-4323-bfe2-185d7d1141a9-00-3ujg2stfczqbx.riker.replit.dev/api/checks",
        {
          applicant_id: "edward",
          report_names: ["document", "facial_similarity_photo"],
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization:
            `Token token=${envToken}`,
          },
        }
      );
    }
    catch(err){
      console.log(err)
    }
  }

  const initOnfido = async () => {
    try {
      const mountElement = document.getElementById("onfido-mount");
      if (!mountElement) {
        throw new Error("Element with id 'onfido-mount' not found.");
      }

      const token = await fetchToken(); // Assuming you have a fetchToken function
      //console.log(token, "tk");
      const instance = init({
        token: token,
        containerId: "onfido-mount",
        onComplete: (data) => {
          console.log("Verification completed", data);
          // if (data.success) {
          //   // Handle success
          //   alert("Verification successful!");
          //   // Perform additional actions...
          // } else {
          //   // Handle failure
          //   alert("Verification failed: " + data.message);
          //   // Allow user to retry verification...
          // }
          // submitCheck()
        },
        onError: (error) => {
          console.error("Onfido error", error);
        },
        steps: [
          {
            type: "document",
            options: {
              documentTypes: {
                passport: true,
                driving_licence: true,
                national_identity_card: true,
              },
            },
          },
          "face",
        ],
      });
      setOnfidoInstance(instance);
      //setLoading(false);
    } catch (error) {
      console.error("Error initializing Onfido", error);
      // Handle error state if necessary
    }
  };

  useEffect(() => {
    initOnfido();
    return () => {
      console.log("tear down", onfidoInstance);
      onfidoInstance && onfidoInstance.tearDown();
    };
  }, []);

  return <div id="onfido-mount"></div>;
}

export default App;
