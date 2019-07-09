$(function () {

    QUnit.module("passing tests", {});

    QUnit.test('should pass comparing objects', function (assert) {
        var one = {some: "content", other: {stuff: "here"}},
            two = {some: "content", other: {stuff: "here"}};

        assert.deepEqual(one, two, 'Should be the same');
    });

    QUnit.test('should continue after async test', function (assert) {
        var ready = assert.async();
        assert.expect(1);
        setTimeout(function () {
                assert.ok(true, 'It is true');
                ready();
            },
            0
        );
    });

});