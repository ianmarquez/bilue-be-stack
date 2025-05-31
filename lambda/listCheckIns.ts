exports.handler = async (event: any) => {
  console.log("Event: ", event);
  return {
    statusCode: 200,
    body: "sample response",
  };
};
