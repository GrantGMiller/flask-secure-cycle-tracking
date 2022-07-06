function clickButton(id) {
  console.log("clickButton(id=", id);
  id = Number(id);
  let timestamp = null;

  const inputDate = $("#input_date").val();
  if (inputDate) {
    let [year, month, date] = inputDate.split("-");
    month = Number(month) - 1;
    timestamp = new Date(year, month, date) / 1000;
  } else {
    timestamp = null;
  }

  load(
    getKey(),
    (obj) => {
      add(obj, id, timestamp);
    },
    (err) => {
      console.log("no obj found, staring with blank object");
      add(null, id, timestamp);
    }
  );
}

function add(obj, id, timestamp) {
  // timestamp should be nullish or in seconds since epoch
  console.log("add(obj=", obj, ", id=", id, ", timestamp=", timestamp);
  obj = obj ?? {};
  const key = timestamp || new Date() / 1000;
  obj[key] = id;
  console.log("new obj=", obj);
  save(obj, getKey(), (resp) => {
    console.log("saved new data point");
    location.reload();
  });
}

const FUNC_MAP = {
  HAD_SEX: 0,
  HAD_BLEEDING: 1,
  HAD_CRAMPING: 2,
  PREG_TEST_POSITIVE: 3,
  PREG_TEST_NEGATIVE: 4,
};

function LoadUI() {
  load(getKey(), (obj) => {
    let latest = {};
    Object.entries(obj).forEach((tup) => {
      const timestamp = Number(tup[0]); // stored in json keys as strings per JSON protocol
      const action = tup[1];
      console.log("action=", action, ", timestamp=", timestamp);
      if (Number.isInteger(action)) {
        if (!latest[action]) {
          latest[action] = timestamp;
        } else if (latest[action] < timestamp) {
          latest[action] = timestamp;
        }
      }
    });
    console.log("latest=", latest);

    $("#last_period").text(TimeStampToMonthDate(latest[FUNC_MAP.HAD_BLEEDING]));
    $("#last_had_cramping").text(
      TimeStampToMonthDate(latest[FUNC_MAP.HAD_CRAMPING])
    );
    $("#last_had_sex").text(TimeStampToMonthDate(latest[FUNC_MAP.HAD_SEX]));
    $("#last_preg_positive").text(
      TimeStampToMonthDate(latest[FUNC_MAP.PREG_TEST_POSITIVE])
    );
    $("#last_preg_negative").text(
      TimeStampToMonthDate(latest[FUNC_MAP.PREG_TEST_NEGATIVE])
    );

    // day 1 is first day of last period
    // fertile from day 9-14

    // get the first bleeding in the last 45 days
    const start = new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 45); //45 days ago
    const end = new Date(); // now

    let firstDayOfLastPeriod = null;
    Object.entries(obj).forEach((tup) => {
      const timestamp = Number(tup[0]); // stored in json keys as strings per JSON protocol
      const action = tup[1];

      if (action == FUNC_MAP.HAD_BLEEDING && start <= timestamp <= end) {
        if (firstDayOfLastPeriod === null) {
          firstDayOfLastPeriod = timestamp;
        } else if (timestamp < firstDayOfLastPeriod) {
          firstDayOfLastPeriod = timestamp;
        }
      }
    });

    console.log("firstDayOfLastPeriod=", firstDayOfLastPeriod);

    if (firstDayOfLastPeriod) {
      const fertileWindowStart =
        new Date(
          firstDayOfLastPeriod * 1000 + 1000 * 60 * 60 * 24 * 9
        ).getTime() / 1000;
      const fertileWindowEnd =
        new Date(
          firstDayOfLastPeriod * 1000 + 1000 * 60 * 60 * 24 * 14
        ).getTime() / 1000;
      console.log("fertileWindowStart=", fertileWindowStart);
      console.log("fertileWindowEnd=", fertileWindowEnd);

      $("#predicted_fertile_window").text(
        TimeStampToMonthDate(fertileWindowStart) +
          " - " +
          TimeStampToMonthDate(fertileWindowEnd)
      );
    }

    // assume 35 day cycle
    // todo: auto adjust this value, store it in the blob
    const firtDayOfNextPeriod =
      new Date(firstDayOfLastPeriod * 1000 + 1000 * 60 * 60 * 24 * 35) / 1000;
    console.log("firtDayOfNextPeriod=", firtDayOfNextPeriod);
    $("#predicted_next_period").text(TimeStampToMonthDate(firtDayOfNextPeriod));
  });
}

function TimeStampToMonthDate(timestamp) {
  console.log("TimeStampToMonthDate(timestamp=", timestamp);
  const d = new Date(timestamp * 1000);
  console.log("d=", d);
  const ret = "" + (d.getMonth() + 1) + "/" + d.getDate();
  console.log("ret=", ret);
  if (ret.indexOf("NaN") >= 0) {
    return "";
  }
  return ret;
}
